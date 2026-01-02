"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardTopbar } from "@/components/dashboard/topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { 
  Search, 
  BookOpen, 
  Download, 
  ExternalLink, 
  User, 
  Languages,
  ChevronLeft,
  ChevronRight,
  Loader2,
  BookMarked,
  Upload,
  Save,
  Trash2,
  Eye,
  Plus,
  X,
  FileText
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// Interface para libros de Gutendex
interface GutendexBook {
  id: number
  title: string
  authors: Array<{
    name: string
    birth_year: number | null
    death_year: number | null
  }>
  subjects: string[]
  languages: string[]
  formats: { [key: string]: string }
  download_count: number
}

// Interface para libros guardados
interface SavedBook {
  id: string
  titulo: string
  autor: string
  descripcion?: string
  tipo: 'subido' | 'externo'
  formato?: string
  url?: string
  archivo?: string | File
  fecha_guardado: string
  portada?: string
  gutendex_id?: number
}

const languageNames: { [key: string]: string } = {
  en: "Inglés",
  es: "Español",
  fr: "Francés",
  de: "Alemán",
  it: "Italiano",
  pt: "Portugués"
}

export default function BibliotecaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Tabs
  const [activeTab, setActiveTab] = useState<"mis-libros" | "buscar">("mis-libros")
  
  // Libros guardados
  const [savedBooks, setSavedBooks] = useState<SavedBook[]>([])
  const [searchSavedBooks, setSearchSavedBooks] = useState("")
  
  // Búsqueda en Gutendex
  const [searchResults, setSearchResults] = useState<GutendexBook[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalBooks, setTotalBooks] = useState(0)
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null)
  const [prevPageUrl, setPrevPageUrl] = useState<string | null>(null)
  
  // Modales
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showSaveExternalModal, setShowSaveExternalModal] = useState(false)
  const [showBookDetailModal, setShowBookDetailModal] = useState(false)
  const [selectedBook, setSelectedBook] = useState<GutendexBook | null>(null)
  const [selectedSavedBook, setSelectedSavedBook] = useState<SavedBook | null>(null)
  
  // Formulario de subida
  const [uploadForm, setUploadForm] = useState({
    titulo: "",
    autor: "",
    descripcion: "",
    archivo: null as File | null
  })

  useEffect(() => {
    const userData = localStorage.getItem("fisiolab_user")
    if (!userData) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(userData))
    loadSavedBooks()
  }, [router])

  // Cargar libros guardados desde localStorage
  const loadSavedBooks = () => {
    const saved = localStorage.getItem("fisiolab_biblioteca")
    if (saved) {
      setSavedBooks(JSON.parse(saved))
    }
  }

  // Guardar libros en localStorage
  const saveBooksToStorage = (books: SavedBook[]) => {
    localStorage.setItem("fisiolab_biblioteca", JSON.stringify(books))
    setSavedBooks(books)
  }

  // Buscar en Gutendex
  const searchGutendex = async (url?: string) => {
    setLoading(true)
    try {
      let apiUrl = url || "https://gutendex.com/books/"
      
      if (!url) {
        const params = new URLSearchParams()
        if (searchTerm) params.append("search", searchTerm)
        if (selectedLanguage && selectedLanguage !== "all") params.append("languages", selectedLanguage)
        
        if (params.toString()) {
          apiUrl = `https://gutendex.com/books/?${params.toString()}`
        }
      }

      const response = await fetch(apiUrl)
      const data = await response.json()
      
      setSearchResults(data.results || [])
      setTotalBooks(data.count || 0)
      setNextPageUrl(data.next)
      setPrevPageUrl(data.previous)
    } catch (error) {
      console.error("Error buscando libros:", error)
      toast({
        title: "Error",
        description: "No se pudieron buscar los libros",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Subir libro propio
  const handleUploadBook = async () => {
    if (!uploadForm.titulo || !uploadForm.autor || !uploadForm.archivo) {
      toast({
        title: "Campos requeridos",
        description: "Completa título, autor y selecciona un archivo",
        variant: "destructive"
      })
      return
    }

    const newBook: SavedBook = {
      id: Date.now().toString(),
      titulo: uploadForm.titulo,
      autor: uploadForm.autor,
      descripcion: uploadForm.descripcion,
      tipo: 'subido',
      formato: uploadForm.archivo.name.split('.').pop()?.toUpperCase(),
      archivo: uploadForm.archivo,
      fecha_guardado: new Date().toISOString()
    }

    const updatedBooks = [newBook, ...savedBooks]
    saveBooksToStorage(updatedBooks)

    toast({
      title: "✅ Libro subido",
      description: `"${uploadForm.titulo}" se agregó a tu biblioteca`
    })

    setShowUploadModal(false)
    setUploadForm({ titulo: "", autor: "", descripcion: "", archivo: null })
    setActiveTab("mis-libros")
  }

  // Guardar libro de Gutendex
  const saveExternalBook = (book: GutendexBook) => {
    const existingBook = savedBooks.find(b => b.gutendex_id === book.id)
    
    if (existingBook) {
      toast({
        title: "Libro ya guardado",
        description: "Este libro ya está en tu biblioteca",
        variant: "destructive"
      })
      return
    }

    const formats = book.formats
    const pdfUrl = formats["application/pdf"] || formats["application/epub+zip"]
    const coverUrl = formats["image/jpeg"]

    const newBook: SavedBook = {
      id: Date.now().toString(),
      gutendex_id: book.id,
      titulo: book.title,
      autor: book.authors.map(a => a.name).join(", ") || "Desconocido",
      descripcion: book.subjects.slice(0, 3).join(", "),
      tipo: 'externo',
      formato: pdfUrl ? "PDF/EPUB" : "HTML",
      url: pdfUrl || formats["text/html"],
      fecha_guardado: new Date().toISOString(),
      portada: coverUrl
    }

    const updatedBooks = [newBook, ...savedBooks]
    saveBooksToStorage(updatedBooks)

    toast({
      title: "✅ Libro guardado",
      description: `"${book.title}" se agregó a tu biblioteca`
    })
  }

  // Eliminar libro guardado
  const deleteBook = (bookId: string) => {
    const updatedBooks = savedBooks.filter(b => b.id !== bookId)
    saveBooksToStorage(updatedBooks)
    
    toast({
      title: "Libro eliminado",
      description: "El libro se eliminó de tu biblioteca"
    })
  }

  // Filtrar libros guardados
  const filteredSavedBooks = savedBooks.filter(book =>
    book.titulo.toLowerCase().includes(searchSavedBooks.toLowerCase()) ||
    book.autor.toLowerCase().includes(searchSavedBooks.toLowerCase())
  )

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#056CF2]" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardTopbar user={user} />
        
        <main className="flex-1 p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Biblioteca Digital</h1>
              <p className="text-gray-600">
                Gestiona tus libros y busca en más de 70,000 títulos gratuitos
              </p>
            </div>
            <Button
              onClick={() => setShowUploadModal(true)}
              className="bg-[#056CF2] hover:bg-[#0455C2]"
            >
              <Upload className="h-4 w-4 mr-2" />
              Subir Libro
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="mis-libros">
                <BookMarked className="h-4 w-4 mr-2" />
                Mis Libros ({savedBooks.length})
              </TabsTrigger>
              <TabsTrigger value="buscar">
                <Search className="h-4 w-4 mr-2" />
                Buscar Gratuitos
              </TabsTrigger>
            </TabsList>

            {/* Tab: Mis Libros */}
            <TabsContent value="mis-libros" className="space-y-4">
              {/* Búsqueda local */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar en mi biblioteca..."
                    value={searchSavedBooks}
                    onChange={(e) => setSearchSavedBooks(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Lista de libros guardados */}
              {filteredSavedBooks.length === 0 ? (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center">
                      <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-600">No tienes libros guardados</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Sube tus propios libros o busca en internet
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredSavedBooks.map((book) => (
                    <Card key={book.id} className="hover:shadow-lg transition-all group">
                      <div className="aspect-2/3 relative bg-linear-to-br from-[#056CF2] to-[#0AA640] flex items-center justify-center">
                        {book.portada ? (
                          <img
                            src={book.portada}
                            alt={book.titulo}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FileText className="h-16 w-16 text-white/50" />
                        )}
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className="text-xs">
                            {book.tipo === 'subido' ? '📤 Subido' : '🌐 Web'}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                          {book.titulo}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {book.autor}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline" className="text-[10px]">
                            {book.formato}
                          </Badge>
                          <div className="flex gap-1">
                            {book.url && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0"
                                onClick={() => window.open(book.url, "_blank")}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-red-600"
                              onClick={() => deleteBook(book.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {format(new Date(book.fecha_guardado), "dd MMM yyyy", { locale: es })}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Tab: Buscar en Internet */}
            <TabsContent value="buscar" className="space-y-4">
              {/* Búsqueda */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Buscar libros (ej: anatomy, medicine, exercise)..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && searchGutendex()}
                      className="flex-1"
                    />
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="px-3 py-2 border rounded-md"
                    >
                      <option value="all">Todos</option>
                      <option value="es">Español</option>
                      <option value="en">Inglés</option>
                      <option value="fr">Francés</option>
                      <option value="de">Alemán</option>
                    </select>
                    <Button onClick={() => searchGutendex()} className="bg-[#056CF2]">
                      <Search className="h-4 w-4 mr-2" />
                      Buscar
                    </Button>
                  </div>

                  {/* Sugerencias */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-sm text-gray-500">Sugerencias:</span>
                    {["anatomy", "medicine", "physiology", "health", "exercise"].map(topic => (
                      <Badge
                        key={topic}
                        variant="outline"
                        className="cursor-pointer hover:bg-[#EBF5FF]"
                        onClick={() => {
                          setSearchTerm(topic)
                          searchGutendex()
                        }}
                      >
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Resultados */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#056CF2]" />
                </div>
              ) : searchResults.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600">Busca libros gratuitos en Project Gutenberg</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {searchResults.map(book => (
                      <Card key={book.id} className="hover:shadow-lg transition-all group">
                        <div className="aspect-2/3 relative bg-gray-100">
                          <img
                            src={book.formats["image/jpeg"] || "https://via.placeholder.com/200x300?text=Sin+Portada"}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardContent className="p-3">
                          <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                            {book.title}
                          </h3>
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {book.authors.map(a => a.name).join(", ") || "Desconocido"}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <Badge variant="outline" className="text-[10px]">
                              {languageNames[book.languages[0]] || book.languages[0]}
                            </Badge>
                            <Button
                              size="sm"
                              className="h-7 text-xs bg-[#0AA640] hover:bg-[#098A36]"
                              onClick={() => saveExternalBook(book)}
                            >
                              <Save className="h-3 w-3 mr-1" />
                              Guardar
                            </Button>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {book.download_count.toLocaleString()} descargas
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Paginación */}
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      {totalBooks.toLocaleString()} libros encontrados
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!prevPageUrl}
                        onClick={() => prevPageUrl && searchGutendex(prevPageUrl)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!nextPageUrl}
                        onClick={() => nextPageUrl && searchGutendex(nextPageUrl)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Modal: Subir Libro */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-[#056CF2]" />
              Subir Libro
            </DialogTitle>
            <DialogDescription>
              Agrega tus propios libros (PDF, EPUB, etc.)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={uploadForm.titulo}
                onChange={(e) => setUploadForm({ ...uploadForm, titulo: e.target.value })}
                placeholder="Anatomía Humana"
              />
            </div>

            <div>
              <Label htmlFor="autor">Autor *</Label>
              <Input
                id="autor"
                value={uploadForm.autor}
                onChange={(e) => setUploadForm({ ...uploadForm, autor: e.target.value })}
                placeholder="Dr. Juan Pérez"
              />
            </div>

            <div>
              <Label htmlFor="descripcion">Descripción (opcional)</Label>
              <Textarea
                id="descripcion"
                value={uploadForm.descripcion}
                onChange={(e) => setUploadForm({ ...uploadForm, descripcion: e.target.value })}
                placeholder="Breve descripción del libro..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="archivo">Archivo *</Label>
              <div className="mt-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="archivo"
                  accept=".pdf,.epub,.mobi,.txt"
                  onChange={(e) => setUploadForm({ ...uploadForm, archivo: e.target.files?.[0] || null })}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadForm.archivo ? uploadForm.archivo.name : "Seleccionar archivo"}
                </Button>
                <p className="text-xs text-gray-500 mt-1">
                  Formatos: PDF, EPUB, MOBI, TXT
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleUploadBook}
              className="bg-[#056CF2] hover:bg-[#0455C2]"
            >
              <Upload className="h-4 w-4 mr-2" />
              Subir Libro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
