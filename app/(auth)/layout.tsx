export default function AuthLayout({ children }: LayoutProps<'/'>) {
  return (
    <body className="min-h-screen flex items-center justify-center">
      <div></div>
      
      {children}
    </body>
  )
}
