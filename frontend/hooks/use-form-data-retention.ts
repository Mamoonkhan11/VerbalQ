import { useState, useEffect, useCallback } from 'react';

interface FormDataState {
  grammar?: {
    inputText: string;
    selectedLanguage: string;
    timestamp: number;
  };
  translate?: {
    inputText: string;
    outputText: string;
    sourceLang: string;
    targetLang: string;
    timestamp: number;
  };
  humanize?: {
    inputText: string;
    tone: string;
    timestamp: number;
  };
}

type GrammarFormData = NonNullable<FormDataState['grammar']>;
type TranslateFormData = NonNullable<FormDataState['translate']>;
type HumanizeFormData = NonNullable<FormDataState['humanize']>;

const FORM_DATA_KEY = 'verbalq_form_data';
const RETENTION_TIME = 60 * 1000; // 1 minute in milliseconds

/**
 * Hook to manage form data retention across page navigation
 * Automatically clears data after 1 minute
 */
export function useFormDataRetention() {
  const [formData, setFormData] = useState<FormDataState>({});

  // Load form data on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FORM_DATA_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Filter out expired entries
        const now = Date.now();
        const validData: FormDataState = {};
        
        Object.keys(parsed).forEach((key) => {
          const entry = parsed[key];
          if (now - entry.timestamp < RETENTION_TIME) {
            validData[key as keyof FormDataState] = entry;
          }
        });
        
        setFormData(validData);
        localStorage.setItem(FORM_DATA_KEY, JSON.stringify(validData));
      }
    } catch (error) {
      console.error('Failed to load form data:', error);
    }
  }, []);

  // Save form data
  const saveFormData = useCallback(<T extends keyof FormDataState>(
    service: T, 
    data: Omit<NonNullable<FormDataState[T]>, 'timestamp'>
  ) => {
    try {
      setFormData(prev => {
        const newData = {
          ...prev,
          [service]: {
            ...data,
            timestamp: Date.now(),
          },
        };
        localStorage.setItem(FORM_DATA_KEY, JSON.stringify(newData));
        return newData;
      });
    } catch (error) {
      console.error('Failed to save form data:', error);
    }
  }, []);

  // Get form data for a specific service
  const getFormData = useCallback(<T extends keyof FormDataState>(service: T): FormDataState[T] | null => {
    try {
      const data = formData[service];
      if (!data) return null;
      
      // Check if data is expired
      if (Date.now() - data.timestamp >= RETENTION_TIME) {
        return null;
      }
      
      return data as FormDataState[T];
    } catch (error) {
      console.error('Failed to get form data:', error);
      return null;
    }
  }, [formData]);

  // Clear form data for a specific service
  const clearFormData = useCallback((service: keyof FormDataState) => {
    try {
      setFormData(prev => {
        const newData = { ...prev };
        delete newData[service];
        localStorage.setItem(FORM_DATA_KEY, JSON.stringify(newData));
        return newData;
      });
    } catch (error) {
      console.error('Failed to clear form data:', error);
    }
  }, []);

  // Clear all form data
  const clearAllFormData = useCallback(() => {
    try {
      setFormData({});
      localStorage.removeItem(FORM_DATA_KEY);
    } catch (error) {
      console.error('Failed to clear all form data:', error);
    }
  }, []);

  return {
    formData,
    saveFormData,
    getFormData,
    clearFormData,
    clearAllFormData,
  };
}
