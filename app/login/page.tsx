"use client";

import { useRef } from "react";
import Link from "next/link";
import { Container, Flex, Text } from "@radix-ui/themes";
import { FiArrowLeft } from "react-icons/fi";
import NavBar from "@/components/ui/NavBar";
import DemoAccountsCard from "@/components/ui/DemoAccountsCard";
import LoginForm, { LoginFormRef } from "@/components/forms/LoginForm";

export default function LoginPage() {
  const loginFormRef = useRef<LoginFormRef>(null);

  const handleFillDemoAccount = (email: string, password: string) => {
    // Use the ref to fill the form in LoginForm component
    loginFormRef.current?.fillForm(email, password);
  };

  return (
    <div className="min-h-screen bg-mint-50">
      <NavBar />

      <Container size="3" className="py-12">
        <Flex direction="column" gap="6">
          {/* Back to Home Link */}
          <Link
            href="/"
            className="flex items-center gap-2 text-mint-600 hover:text-mint-700 transition-colors w-fit"
          >
            <FiArrowLeft size={20} />
            <Text>Quay lại trang chủ</Text>
          </Link>

          <Flex direction={{ initial: "column", md: "row" }} gap="6">
            {/* Login Form */}
            <LoginForm ref={loginFormRef} />

            {/* Demo Accounts Card */}
            <div className="flex-1 max-w-md">
              <DemoAccountsCard onFillForm={handleFillDemoAccount} />
            </div>
          </Flex>
        </Flex>
      </Container>
    </div>
  );
}
