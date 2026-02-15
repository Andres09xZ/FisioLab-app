"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Stethoscope, Users, Heart } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "FISIOTERAPEUTA",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (!formData.name || !formData.email || !formData.password) {
      setError("Por favor completa todos los campos")
      return
    }

    setLoading(true)

    try {
      // Hacer solicitud al backend
      const response = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          nombre: formData.name.split(" ")[0],
          apellido: formData.name.split(" ").slice(1).join(" ") || formData.name,
          rol: formData.role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Error al registrar el usuario")
        setLoading(false)
        return
      }

      // Guardar token y usuario en localStorage
      localStorage.setItem("fisiolab_token", data.data.token)
      localStorage.setItem(
        "fisiolab_user",
        JSON.stringify({
          id: data.data.user.id,
          name: `${data.data.user.nombre} ${data.data.user.apellido}`,
          role: data.data.user.rol,
          email: data.data.user.email,
        }),
      )

      // Redirigir al dashboard
      router.push("/dashboard")
    } catch (err) {
      setError("Error de conexión. Verifica que el backend esté corriendo en http://localhost:3001")
      console.error("Error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-emerald-600 mb-2">FisioLab ST</h1>
          <p className="text-gray-600">Sistema de Gestión Profesional</p>
        </div>

        <Card className="border-emerald-100">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Crear Cuenta</CardTitle>
            <CardDescription className="text-center">Completa el formulario para registrarte</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            <form onSubmit={handleRegister} className="space-y-6">
              {/* Seleccionar Rol */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">¿Qué rol deseas?</Label>
                <div className="space-y-2">
                  {/* Opción: Doctor */}
                  <div
                    className={`flex items-center space-x-3 p-3 rounded border-2 cursor-pointer transition-all ${
                      formData.role === "DOCTOR"
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 hover:border-emerald-400"
                    }`}
                    onClick={() => setFormData({ ...formData, role: "DOCTOR" })}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="DOCTOR"
                      checked={formData.role === "DOCTOR"}
                      onChange={() => setFormData({ ...formData, role: "DOCTOR" })}
                      className="w-5 h-5 cursor-pointer"
                    />
                    <div className="flex items-center space-x-2 flex-1">
                      <Stethoscope className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-semibold text-sm">Doctor</p>
                        <p className="text-xs text-gray-500">Crear y gestionar historias clínicas</p>
                      </div>
                    </div>
                  </div>

                  {/* Opción: Paciente */}
                  <div
                    className={`flex items-center space-x-3 p-3 rounded border-2 cursor-pointer transition-all ${
                      formData.role === "PACIENTE"
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 hover:border-emerald-400"
                    }`}
                    onClick={() => setFormData({ ...formData, role: "PACIENTE" })}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="PACIENTE"
                      checked={formData.role === "PACIENTE"}
                      onChange={() => setFormData({ ...formData, role: "PACIENTE" })}
                      className="w-5 h-5 cursor-pointer"
                    />
                    <div className="flex items-center space-x-2 flex-1">
                      <Users className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-semibold text-sm">Paciente</p>
                        <p className="text-xs text-gray-500">Ver mis citas y tratamientos</p>
                      </div>
                    </div>
                  </div>

                  {/* Opción: Fisioterapeuta */}
                  <div
                    className={`flex items-center space-x-3 p-3 rounded border-2 cursor-pointer transition-all ${
                      formData.role === "FISIOTERAPEUTA"
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 hover:border-emerald-400"
                    }`}
                    onClick={() => setFormData({ ...formData, role: "FISIOTERAPEUTA" })}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="FISIOTERAPEUTA"
                      checked={formData.role === "FISIOTERAPEUTA"}
                      onChange={() => setFormData({ ...formData, role: "FISIOTERAPEUTA" })}
                      className="w-5 h-5 cursor-pointer"
                    />
                    <div className="flex items-center space-x-2 flex-1">
                      <Heart className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="font-semibold text-sm">Fisioterapeuta</p>
                        <p className="text-xs text-gray-500">Ejecutar sesiones y terapias</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Dr. Juan Pérez"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                  className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repite tu contraseña"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={loading}
              >
                {loading ? "Creando cuenta..." : "Registrarse"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">¿Ya tienes cuenta? </span>
              <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                Inicia sesión
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
