import { TextInput } from 'react-native';
import { Controller } from 'react-hook-form';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import { AppError } from '../../../core/api';
import { Routes } from '../../../core/navigation/routes';

import { useAuthViewModel, type AuthViewModel } from '../hooks/useAuthViewModel';

const mockNavigationReset = jest.fn();
const mockShowToast = jest.fn();
const mockSignIn = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ reset: mockNavigationReset }),
}));

jest.mock('../../../core/shared/repositories/auth', () => ({
  authRepository: {
    signIn: (...args: unknown[]) => mockSignIn(...args),
  },
}));

jest.mock('../../../core/shared/services', () => ({
  useAppStateStore: {
    getState: () => ({ showToast: mockShowToast }),
  },
}));

jest.mock('../../../core/utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));



/**
 * Harness mínimo: monta o hook e expõe a instância atual via callback,
 * mais dois TextInputs ligados via Controller — assim os campos ficam
 * registrados no react-hook-form e o submit dispara a validação real.
 */
const Harness = ({ onVm }: { onVm: (vm: AuthViewModel) => void }) => {
  const vm = useAuthViewModel();
  onVm(vm);
  return (
    <>
      <Controller
        control={vm.control}
        name="login"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            testID="login-input"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />
      <Controller
        control={vm.control}
        name="password"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            testID="password-input"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />
    </>
  );
};

const setup = () => {
  const captured: { vm: AuthViewModel | null } = { vm: null };
  const utils = render(<Harness onVm={vm => (captured.vm = vm)} />);
  const getVm = () => {
    if (!captured.vm) throw new Error('ViewModel ainda não foi capturado');
    return captured.vm;
  };
  return { ...utils, getVm };
};

describe('useAuthViewModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('expõe estado inicial coerente', () => {
    const { getVm } = setup();
    const vm = getVm();

    expect(vm.subtitle).toBe('Acesso seguro ao portal corporativo');
    expect(vm.isSubmitting).toBe(false);
    expect(vm.submissionError).toBeNull();
    expect(vm.errors).toEqual({});
    expect(typeof vm.onSubmit).toBe('function');
  });

  it('valida campos vazios e não chama o repository', async () => {
    const { getVm } = setup();

    await act(async () => {
      await getVm().onSubmit();
    });

    expect(mockSignIn).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(getVm().errors.login?.message).toBe('Informe seu login');
      expect(getVm().errors.password?.message).toBe(
        'Senha deve ter no mínimo 4 caracteres',
      );
    });
  });

  it('valida senha curta (<4)', async () => {
    const { getVm, getByTestId } = setup();

    fireEvent.changeText(getByTestId('login-input'), 'ana@x.com');
    fireEvent.changeText(getByTestId('password-input'), '12');

    await act(async () => {
      await getVm().onSubmit();
    });

    expect(mockSignIn).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(getVm().errors.password?.message).toBe(
        'Senha deve ter no mínimo 4 caracteres',
      );
    });
  });

  it('em sucesso: chama mockSignIn com login trim() e reseta navegação para Home', async () => {
    mockSignIn.mockResolvedValueOnce({ token: 't', user: { id: '1' } });
    const { getVm, getByTestId } = setup();

    fireEvent.changeText(getByTestId('login-input'), '  ana@x.com  ');
    fireEvent.changeText(getByTestId('password-input'), 'segredo');

    await act(async () => {
      await getVm().onSubmit();
    });

    expect(mockSignIn).toHaveBeenCalledWith({
      login: 'ana@x.com',
      password: 'segredo',
    });
    expect(mockNavigationReset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: Routes.Home }],
    });
    expect(getVm().submissionError).toBeNull();
    expect(getVm().isSubmitting).toBe(false);
  });

  it('isSubmitting fica true durante o request e volta a false ao final', async () => {
    let resolveSignIn: (v: unknown) => void = () => {};
    mockSignIn.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          resolveSignIn = resolve;
        }),
    );

    const { getVm, getByTestId } = setup();
    fireEvent.changeText(getByTestId('login-input'), 'a@x.com');
    fireEvent.changeText(getByTestId('password-input'), 'segredo');

    // O tipo declarado em AuthViewModel é `() => void`, mas em runtime
    // handleSubmit retorna uma Promise — capturamos via cast para encadear.
    let submitPromise: Promise<void> | undefined;
    act(() => {
      submitPromise = (getVm().onSubmit as unknown as () => Promise<void>)();
    });

    await waitFor(() => expect(getVm().isSubmitting).toBe(true));

    await act(async () => {
      resolveSignIn({ token: 't', user: { id: '1' } });
      await submitPromise;
    });

    expect(getVm().isSubmitting).toBe(false);
  });

  it('em 401 (unauthorized): seta submissionError inline e NÃO navega/toasta', async () => {
    mockSignIn.mockRejectedValueOnce(
      new AppError('unauthorized', 'invalid', 401),
    );
    const { getVm, getByTestId } = setup();

    fireEvent.changeText(getByTestId('login-input'), 'a@x.com');
    fireEvent.changeText(getByTestId('password-input'), 'errada');

    await act(async () => {
      await getVm().onSubmit();
    });

    expect(getVm().submissionError).toBe(
      'A senha inserida está incorreta. Tente novamente.',
    );
    expect(mockShowToast).not.toHaveBeenCalled();
    expect(mockNavigationReset).not.toHaveBeenCalled();
  });

  it('em network: dispara toast "Sem conexão" e mantém card limpo', async () => {
    mockSignIn.mockRejectedValueOnce(new AppError('network', 'offline'));
    const { getVm, getByTestId } = setup();

    fireEvent.changeText(getByTestId('login-input'), 'a@x.com');
    fireEvent.changeText(getByTestId('password-input'), 'segredo');

    await act(async () => {
      await getVm().onSubmit();
    });

    expect(mockShowToast).toHaveBeenCalledWith(
      'Sem conexão — verifique sua internet.',
      'error',
    );
    expect(getVm().submissionError).toBeNull();
  });

  it('em timeout: também dispara o toast "Sem conexão"', async () => {
    mockSignIn.mockRejectedValueOnce(new AppError('timeout', 'slow'));
    const { getVm, getByTestId } = setup();

    fireEvent.changeText(getByTestId('login-input'), 'a@x.com');
    fireEvent.changeText(getByTestId('password-input'), 'segredo');

    await act(async () => {
      await getVm().onSubmit();
    });

    expect(mockShowToast).toHaveBeenCalledWith(
      'Sem conexão — verifique sua internet.',
      'error',
    );
  });

  it('em erro genérico (server): toast com a mensagem do AppError', async () => {
    mockSignIn.mockRejectedValueOnce(new AppError('server', 'boom', 500));
    const { getVm, getByTestId } = setup();

    fireEvent.changeText(getByTestId('login-input'), 'a@x.com');
    fireEvent.changeText(getByTestId('password-input'), 'segredo');

    await act(async () => {
      await getVm().onSubmit();
    });

    expect(mockShowToast).toHaveBeenCalledWith('boom', 'error');
    expect(getVm().submissionError).toBeNull();
  });

  it('em erro genérico sem message: toast com fallback "Falha ao entrar."', async () => {
    mockSignIn.mockRejectedValueOnce(new AppError('server', '', 500));
    const { getVm, getByTestId } = setup();

    fireEvent.changeText(getByTestId('login-input'), 'a@x.com');
    fireEvent.changeText(getByTestId('password-input'), 'segredo');

    await act(async () => {
      await getVm().onSubmit();
    });

    expect(mockShowToast).toHaveBeenCalledWith('Falha ao entrar.', 'error');
  });

  it('limpa submissionError em re-submissão bem-sucedida após 401', async () => {
    mockSignIn
      .mockRejectedValueOnce(new AppError('unauthorized', 'x', 401))
      .mockResolvedValueOnce({ token: 't', user: { id: '1' } });

    const { getVm, getByTestId } = setup();

    fireEvent.changeText(getByTestId('login-input'), 'a@x.com');
    fireEvent.changeText(getByTestId('password-input'), 'errada');
    await act(async () => {
      await getVm().onSubmit();
    });
    expect(getVm().submissionError).not.toBeNull();

    fireEvent.changeText(getByTestId('password-input'), 'certa');
    await act(async () => {
      await getVm().onSubmit();
    });

    expect(getVm().submissionError).toBeNull();
    expect(mockNavigationReset).toHaveBeenCalledTimes(1);
  });
});
