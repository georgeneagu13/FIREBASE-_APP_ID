import { renderHook, act } from '@testing-library/react-hooks';
import { useFormValidation, VALIDATION_RULES } from '../../utils/formValidation';

describe('Form Validation', () => {
  const initialValues = {
    email: '',
    password: '',
    confirmPassword: '',
  };

  const validationSchema = {
    email: [
      VALIDATION_RULES.required,
      VALIDATION_RULES.email,
    ],
    password: [
      VALIDATION_RULES.required,
      VALIDATION_RULES.minLength(8),
      VALIDATION_RULES.password,
    ],
    confirmPassword: [
      VALIDATION_RULES.required,
      (value, formValues) => VALIDATION_RULES.matchesField('password', formValues)(value),
    ],
  };

  it('should initialize with default values', () => {
    const { result } = renderHook(() =>
      useFormValidation(initialValues, validationSchema)
    );

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
  });

  it('should validate email field correctly', () => {
    const { result } = renderHook(() =>
      useFormValidation(initialValues, validationSchema)
    );

    act(() => {
      result.current.handleChange('email', 'invalid-email');
      result.current.handleBlur('email');
    });

    expect(result.current.errors.email).toBeTruthy();

    act(() => {
      result.current.handleChange('email', 'valid@email.com');
      result.current.handleBlur('email');
    });

    expect(result.current.errors.email).toBeFalsy();
  });

  it('should validate password requirements', () => {
    const { result } = renderHook(() =>
      useFormValidation(initialValues, validationSchema)
    );

    act(() => {
      result.current.handleChange('password', 'short');
      result.current.handleBlur('password');
    });

    expect(result.current.errors.password).toBeTruthy();

    act(() => {
      result.current.handleChange('password', 'ValidPass123');
      result.current.handleBlur('password');
    });

    expect(result.current.errors.password).toBeFalsy();
  });

  it('should validate matching passwords', () => {
    const { result } = renderHook(() =>
      useFormValidation(initialValues, validationSchema)
    );

    act(() => {
      result.current.handleChange('password', 'ValidPass123');
      result.current.handleChange('confirmPassword', 'DifferentPass123');
      result.current.handleBlur('confirmPassword');
    });

    expect(result.current.errors.confirmPassword).toBeTruthy();

    act(() => {
      result.current.handleChange('confirmPassword', 'ValidPass123');
      result.current.handleBlur('confirmPassword');
    });

    expect(result.current.errors.confirmPassword).toBeFalsy();
  });

  it('should handle form submission', async () => {
    const onSubmit = jest.fn();
    const { result } = renderHook(() =>
      useFormValidation(initialValues, validationSchema)
    );

    const validForm = {
      email: 'test@example.com',
      password: 'ValidPass123',
      confirmPassword: 'ValidPass123',
    };

    act(() => {
      Object.entries(validForm).forEach(([field, value]) => {
        result.current.handleChange(field, value);
        result.current.handleBlur(field);
      });
    });

    await act(async () => {
      await result.current.handleSubmit(onSubmit);
    });

    expect(onSubmit).toHaveBeenCalledWith(validForm);
  });

  it('should prevent submission with validation errors', async () => {
    const onSubmit = jest.fn();
    const { result } = renderHook(() =>
      useFormValidation(initialValues, validationSchema)
    );

    await act(async () => {
      await result.current.handleSubmit(onSubmit);
    });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(Object.keys(result.current.errors).length).toBeGreaterThan(0);
  });
}); 