import React from "react";

export interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
}

const maxWidthStyles = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-7xl",
  xl: "max-w-[1440px]",
  full: "max-w-full",
};

export default function PageContainer({
  children,
  maxWidth = "lg",
  className = "",
}: PageContainerProps) {
  return (
    <div
      className={`mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 ${maxWidthStyles[maxWidth]} ${className}`}
    >
      {children}
    </div>
  );
}
