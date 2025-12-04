"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { FileText, AlertCircle, Calendar } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface ViewHistoriaClinicaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  historiaData: any
  pacienteNombre: string
}

const ANTECEDENTES_LABELS: { [key: string]: string } = {
  cancer: "Cáncer",
  hemopatias: "Hemopatías",
  marcapasos: "Marcapasos",
  diabetes: "Diabetes",
  tuberculosis: "Tuberculosis",
  digestivos_cardiacos: "Digestivos Cardiacos",
  insuficiencia_renal: "Insuficiencia Renal",
  bronquitis: "Bronquitis",
  heridas: "Heridas",
  cardiopatias: "Cardiopatías",
  trombosis: "Trombosis",
  enfer_de_la_piel: "Enfer. de la piel",
  endocarditis: "Endocarditis",
  hemorragias_activas: "Hemorragias Activas",
  epilepsias: "Epilepsias",
  hipertension: "Hipertensión",
  implantes_metalicos: "Implantes Metálicos",
  alterac_sensibilidad: "Alterac. de la sensibilidad",
}

export function ViewHistoriaClinicaModal({ open, onOpenChange, historiaData, pacienteNombre }: ViewHistoriaClinicaModalProps) {
  if (!historiaData) return null

  const historia = historiaData.detalle || {}
  const antecedentes = historia.antecedentes || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <FileText className="h-6 w-6 text-emerald-600" />
            Historia Clínica
          </DialogTitle>
          <DialogDescription>
            Paciente: <span className="font-semibold text-gray-900">{pacienteNombre}</span>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-6 py-4">
            {/* Información del Paciente */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3">Información del Paciente</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Nombre:</span>
                  <p className="font-medium">{historiaData.nombres} {historiaData.apellidos}</p>
                </div>
                <div>
                  <span className="text-gray-600">Documento:</span>
                  <p className="font-medium">{historiaData.documento}</p>
                </div>
                <div>
                  <span className="text-gray-600">Celular:</span>
                  <p className="font-medium">{historiaData.celular}</p>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <p className="font-medium">{historiaData.email}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Antecedentes Patológicos */}
            {antecedentes.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Antecedentes Patológicos
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {antecedentes.map((ant: string) => (
                    <Badge key={ant} variant="outline" className="justify-start">
                      {ANTECEDENTES_LABELS[ant] || ant}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Otros Antecedentes */}
            {historia.otros && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Otros Antecedentes</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{historia.otros}</p>
                </div>
              </div>
            )}

            {/* Notas */}
            {historia.notas && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Notas</h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{historia.notas}</p>
                </div>
              </div>
            )}

            {/* Alergias */}
            {historia.alergias && (
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  Alergias
                </h3>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap font-medium">{historia.alergias}</p>
                </div>
              </div>
            )}

            {/* Diagnóstico */}
            {historia.diagnostico && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Diagnóstico</h3>
                <div className="bg-emerald-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{historia.diagnostico}</p>
                </div>
              </div>
            )}

            {/* Fecha de Creación */}
            {historiaData.created_at && (
              <div className="text-xs text-gray-500 flex items-center gap-2 pt-4 border-t">
                <Calendar className="h-4 w-4" />
                Creada: {format(new Date(historiaData.created_at), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
