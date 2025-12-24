"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useLocale, useTranslations } from 'next-intl';
import {
  Flex,
  Heading,
  Text,
  Button,
  Card,
  TextField,
  Callout,
} from "@radix-ui/themes";
import { FiMail, FiLock, FiAlertCircle, FiLogIn } from "react-icons/fi";
import { useAuth } from "@/contexts/AuthContext";

type LoginFormData = {
  email: string;
  password: string;
};

interface LoginFormProps {
  onFillForm?: (email: string, password: string) => void;
}

export interface LoginFormRef {
  fillForm: (email: string, password: string) => void;
}

const LoginForm = forwardRef<LoginFormRef, LoginFormProps>(
  ({ onFillForm }, ref) => {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const { login, isLoading } = useAuth();
    const locale = useLocale();
    const t = useTranslations('authentication.login');
    const tValidation = useTranslations('authentication.validation');
    const tFields = useTranslations('authentication.fields');

    // Validation schema
    const loginSchema = z.object({
      email: z
        .string()
        .min(1, tValidation('email_required'))
        .email(tValidation('email_invalid')),
      password: z.string().min(6, tValidation('password_min_length')),
    });

    const {
      register,
      handleSubmit,
      setValue,
      formState: { errors },
    } = useForm<LoginFormData>({
      resolver: zodResolver(loginSchema),
    });

    // Expose fillForm method to parent
    useImperativeHandle(ref, () => ({
      fillForm: (email: string, password: string) => {
        setValue("email", email);
        setValue("password", password);
        setErrorMessage(null);
        setSuccessMessage(null);
      },
    }));

    const onSubmit = async (data: LoginFormData) => {
      setErrorMessage(null);
      setSuccessMessage(null);

      try {
        await login(data.email, data.password);
        setSuccessMessage(t('success_redirecting'));
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : t('error_retry')
        );
      }
    };

    return (
      <Card className="flex-1 bg-white border border-mint-200 dark:border-mint-900 p-8">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap="6">
            {/* Header */}
            <Flex direction="column" gap="2" align="center">
              <div className="bg-mint-500 p-4 rounded-full">
                <FiLogIn className="text-white" size={32} />
              </div>
              <Heading size="7" className="text-gray-900">
                {t('heading')}
              </Heading>
              <Text className="text-gray-600 text-center">
                {t('description')}
              </Text>
            </Flex>

            {/* Error Message */}
            {errorMessage && (
              <Callout.Root
                color="red"
                className="animate-in fade-in duration-300"
              >
                <Callout.Icon>
                  <FiAlertCircle />
                </Callout.Icon>
                <Callout.Text>{errorMessage}</Callout.Text>
              </Callout.Root>
            )}

            {/* Success Message */}
            {successMessage && (
              <Callout.Root
                color="green"
                className="animate-in fade-in duration-300"
              >
                <Callout.Text>{successMessage}</Callout.Text>
              </Callout.Root>
            )}

            {/* Email Field */}
            <Flex direction="column" gap="2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                {tFields('email_label')}
              </label>
              <TextField.Root
                id="email"
                type="email"
                placeholder={tFields('email_placeholder')}
                size="3"
                {...register("email")}
                className="w-full"
              >
                <TextField.Slot>
                  <FiMail className="text-gray-400" />
                </TextField.Slot>
              </TextField.Root>
              {errors.email && (
                <Text size="2" className="text-red-500">
                  {errors.email.message}
                </Text>
              )}
            </Flex>

            {/* Password Field */}
            <Flex direction="column" gap="2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                {tFields('password_label')}
              </label>
              <TextField.Root
                id="password"
                type="password"
                placeholder={tFields('password_placeholder')}
                size="3"
                {...register("password")}
                className="w-full"
              >
                <TextField.Slot>
                  <FiLock className="text-gray-400" />
                </TextField.Slot>
              </TextField.Root>
              {errors.password && (
                <Text size="2" className="text-red-500">
                  {errors.password.message}
                </Text>
              )}
            </Flex>

            {/* Remember Me & Forgot Password */}
            <Flex justify="between" align="center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-mint-600 rounded border-gray-300 focus:ring-mint-500 dark:bg-gray-800"
                />
                <Text size="2" className="text-gray-600">
                  {t('remember_me')}
                </Text>
              </label>
              <Link
                href={`/${locale}/forgot-password`}
                className="text-sm text-mint-600 hover:text-mint-700 dark:hover:text-mint-300"
              >
                {t('forgot_password')}
              </Link>
            </Flex>

            {/* Submit Button */}
            <Button
              type="submit"
              size="3"
              disabled={isLoading}
              className="bg-mint-500 hover:bg-mint-600 dark:hover:bg-mint-500 text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed w-full"
            >
              {isLoading ? t('button_loading') : t('button')}
            </Button>

            {/* Divider */}
            <Flex align="center" gap="3">
              <div className="flex-1 h-px bg-gray-300" />
              <Text size="2" className="text-gray-500">
                {t('or')}
              </Text>
              <div className="flex-1 h-px bg-gray-300" />
            </Flex>

            {/* Sign Up Link */}
            <Text size="2" className="text-center text-gray-600">
              {t('no_account')}{" "}
              <Link
                href={`/${locale}/register`}
                className="text-mint-600 hover:text-mint-700 dark:hover:text-mint-300 font-medium"
              >
                {t('register_now')}
              </Link>
            </Text>
          </Flex>
        </form>
      </Card>
    );
  }
);

LoginForm.displayName = "LoginForm";

export default LoginForm;
export { type LoginFormData };
