export default function AuthLayout({ children }: LayoutProps<'/'>) {
  return <body className="min-h-screen flex flex-col items-center justify-content">{children}</body>
}
