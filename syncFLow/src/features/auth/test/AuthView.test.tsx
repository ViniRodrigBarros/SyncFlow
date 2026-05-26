import type { ReactElement } from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { AuthView } from '../presentation/AuthView';

const mockVm = {
  subtitle: 'Acesso seguro ao portal corporativo',
  isSubmitting: false,
  submissionError: null as string | null,
  control: {} as never,
  errors: {} as Record<string, { message: string } | undefined>,
  onSubmit: jest.fn(),
};

let mockCurrentVm = { ...mockVm };

jest.mock('../hooks/useAuthViewModel', () => ({
  useAuthViewModel: () => mockCurrentVm,
}));

// O Controller do react-hook-form precisa de control válido; como mockamos o
// VM com um control vazio, substituímos o Controller por um render direto do
// children com um field "fake" (apenas para a View renderizar os TextFields).
jest.mock('react-hook-form', () => {
  const actual = jest.requireActual('react-hook-form');
  return {
    ...actual,
    Controller: ({
      render,
      name,
    }: {
      render: (args: {
        field: {
          value: string;
          onChange: (v: string) => void;
          onBlur: () => void;
          name: string;
          ref: () => void;
        };
      }) => ReactElement;
      name: string;
    }) =>
      render({
        field: {
          value: '',
          onChange: () => {},
          onBlur: () => {},
          name,
          ref: () => {},
        },
      }),
  };
});

const renderView = (overrides: Partial<typeof mockVm> = {}) => {
  mockCurrentVm = { ...mockVm, onSubmit: jest.fn(), errors: {}, ...overrides };
  return render(<AuthView />);
};

describe('<AuthView />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza o branding e o subtítulo vindo do ViewModel', () => {
    const { getByText } = renderView();

    expect(getByText('SyncFlow')).toBeTruthy();
    expect(getByText('Acesso seguro ao portal corporativo')).toBeTruthy();
  });

  it('renderiza os labels do formulário e o botão "Entrar"', () => {
    const { getByText } = renderView();

    expect(getByText('Email ou Nome de Usuário')).toBeTruthy();
    expect(getByText('Senha')).toBeTruthy();
    expect(getByText('Manter conectado')).toBeTruthy();
    expect(getByText('Entrar')).toBeTruthy();
  });

  it('aciona vm.onSubmit ao pressionar "Entrar"', () => {
    const onSubmit = jest.fn();
    const { getByText } = renderView({ onSubmit });

    fireEvent.press(getByText('Entrar'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('quando isSubmitting=true: o botão fica em estado busy/disabled', () => {
    const { getByRole } = renderView({ isSubmitting: true });

    const button = getByRole('button');
    expect(button.props.accessibilityState).toMatchObject({
      busy: true,
      disabled: true,
    });
  });

  it('exibe a mensagem de erro de validação do campo login', () => {
    const { getByText } = renderView({
      errors: { login: { message: 'Informe seu login' } },
    });

    expect(getByText('Informe seu login')).toBeTruthy();
  });

  it('exibe submissionError no campo senha quando não há errors.password', () => {
    const { getByText } = renderView({
      submissionError: 'A senha inserida está incorreta. Tente novamente.',
    });

    expect(
      getByText('A senha inserida está incorreta. Tente novamente.'),
    ).toBeTruthy();
  });

  it('quando há errors.password E submissionError: prioriza errors.password', () => {
    const { getByText, queryByText } = renderView({
      errors: { password: { message: 'Senha curta' } },
      submissionError: 'erro do servidor',
    });

    expect(getByText('Senha curta')).toBeTruthy();
    expect(queryByText('erro do servidor')).toBeNull();
  });

  it('alterna a visibilidade da senha ao tocar no ícone de olho', () => {
    const { getByTestId, queryByTestId } = renderView();

    // estado inicial: senha oculta → ícone "visibility-off" presente
    expect(getByTestId('icon-visibility-off')).toBeTruthy();
    expect(queryByTestId('icon-visibility')).toBeNull();

    fireEvent.press(getByTestId('icon-visibility-off'));

    expect(getByTestId('icon-visibility')).toBeTruthy();
    expect(queryByTestId('icon-visibility-off')).toBeNull();
  });

  it('marca/desmarca o checkbox "Manter conectado"', () => {
    const { getByText, queryByTestId } = renderView();

    // Estado inicial: checked → o ícone "check" do Checkbox está presente.
    expect(queryByTestId('icon-check')).toBeTruthy();

    fireEvent.press(getByText('Manter conectado'));

    // Desmarcado → o ícone "check" desaparece.
    expect(queryByTestId('icon-check')).toBeNull();
  });
});
