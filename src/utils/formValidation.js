import { useState, useCallback } from 'react';

// Validation rules
export const VALIDATION_RULES = {
  required: (value) => ({
    isValid: value !== undefined && value !== null && value !== '',
    message: 'This field is required',
  }),

  email: (value) => ({
    isValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: 'Please enter a valid email address',
  }),

  minLength: (length) => (value) => ({
    isValid: value.length >= length,
    message: `Must be at least ${length} characters`,
  }),

  maxLength: (length) => (value) => ({
    isValid: value.length <= length,
    message: `Must be no more than ${length} characters`,
  }),

  matches: (pattern, message) => (value) => ({
    isValid: pattern.test(value),
    message,
  }),

  number: (value) => ({
    isValid: !isNaN(value) && value !== '',
    message: 'Please enter a valid number',
  }),

  url: (value) => ({
    isValid: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(value),
    message: 'Please enter a valid URL',
  }),

  phone: (value) => ({
    isValid: /^\+?[\d\s-]+$/.test(value),
    message: 'Please enter a valid phone number',
  }),

  password: (value) => ({
    isValid: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/.test(value),
    message: 'Password must contain at least 8 characters, including letters and numbers',
  }),

  matchesField: (fieldName, formValues) => (value) => ({
    isValid: value === formValues[fieldName],
    message: `Must match ${fieldName}`,
  }),
};

// Custom hook for form validation
export const useFormValidation = (initialValues = {}, validationSchema = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((name, value) => {
    if (!validationSchema[name]) return '';

    const fieldRules = validationSchema[name];
    let error = '';

    for (const rule of fieldRules) {
      if (typeof rule === 'function') {
        const result = rule(value, values);
        if (!result.isValid) {
          error = result.message;
          break;
        }
      }
    }

    return error;
  }, [validationSchema, values]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationSchema).forEach(field => {
      const error = validateField(field, values[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validateField, values, validationSchema]);

  const handleChange = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value,
    }));

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error,
      }));
    }
  }, [touched, validateField]);

  const handleBlur = useCallback((name) => {
    setTouched(prev => ({
      ...prev,
      [name]: true,
    }));

    const error = validateField(name, values[name]);
    setErrors(prev => ({
      ...prev,
      [name]: error,
    }));
  }, [validateField, values]);

  const handleSubmit = useCallback(async (onSubmit) => {
    setIsSubmitting(true);
    
    // Mark all fields as touched
    const allTouched = Object.keys(validationSchema).reduce((acc, field) => ({
      ...acc,
      [field]: true,
    }), {});
    setTouched(allTouched);

    try {
      const isValid = validateForm();
      if (isValid) {
        await onSubmit(values);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message,
      }));
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, values, validationSchema]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    validateField,
    validateForm,
  };
};

// Form field wrapper component
export const FormField = ({
  name,
  value,
  error,
  touched,
  onChange,
  onBlur,
  validate,
  children,
}) => {
  const handleChange = (newValue) => {
    onChange(name, newValue);
    if (validate) {
      validate(name, newValue);
    }
  };

  const handleBlur = () => {
    onBlur(name);
  };

  return children({
    value,
    error: touched && error,
    onChange: handleChange,
    onBlur: handleBlur,
  });
}; 