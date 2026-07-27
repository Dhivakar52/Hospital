import { BrowserRouter } from "react-router-dom"
import { Layout } from "@/layout/Layout"
import { AppRoutes } from "@/routes"
import { ThemeProvider } from "@/context/ThemeContext"

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Layout>
          <AppRoutes />
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App