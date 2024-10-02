'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Search, Star, FileText, Download } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { FieldValues, useForm } from 'react-hook-form'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { debounce } from 'lodash'
import Link from 'next/link'

type User = {
    username: string
    password: string
    email: string
    university: string
}

type Rating = {
    userId: string
    rating: number
}

type Publication = {
    id: string
    name: string
    subject: string
    university: string
    author: User
    featured?: boolean
    file?: File
    ratings: Rating[]
    downloadCount: number
}

const sliderContent = [
    { title: "Bienvenido a UPBlioteca", description: "Tu plataforma para compartir y encontrar documentos de estudio." },
    { title: "Comparte tus apuntes", description: "Ayuda a otros estudiantes compartiendo tus mejores materiales de estudio." },
    { title: "Encuentra recursos valiosos", description: "Accede a una amplia variedad de documentos compartidos por la comunidad." },
]

const StarRating = React.memo(({ rating, onRate }: { rating: number, onRate: (rating: number) => void }) => {
    const [hover, setHover] = useState(0)
    return (
        <div className="flex items-center">
            <div className="flex mr-2">
                {[...Array(5)].map((_, index) => {
                    const ratingValue = index + 1
                    return (
                        <Star
                            key={index}
                            className={`h-5 w-5 cursor-pointer ${
                                ratingValue <= (hover || rating) ? 'text-primary' : 'text-muted'
                            }`}
                            onClick={() => onRate(ratingValue)}
                            onMouseEnter={() => setHover(ratingValue)}
                            onMouseLeave={() => setHover(0)}
                        />
                    )
                })}
            </div>
            <span className="text-sm text-muted-foreground">({rating.toFixed(1)})</span>
        </div>
    )
})

StarRating.displayName = 'StarRating'

export default function Component() {
    const [users, setUsers] = useState<User[]>([])
    const [publications, setPublications] = useState<Publication[]>([])
    const [currentUser, setCurrentUser] = useState<User | null>(null)
    const [currentView, setCurrentView] = useState('home')
    const [sliderIndex, setSliderIndex] = useState(0)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null)
    const [selectedAuthor, setSelectedAuthor] = useState<User | null>(null)
    const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false)
    const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)
    const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
    const publicationsPerPage = 6

    const { register, handleSubmit, setValue, reset } = useForm()

    const [newPublication, setNewPublication] = useState<Omit<Publication, 'author' | 'id' | 'ratings' | 'downloadCount'>>({
        name: '',
        subject: '',
        university: '',
    })

    const validatePassword = (password: string) => {
        const minLength = 8;
        const hasNumber = /\d/.test(password);
        const hasSpecialChar = /[.*\-\/!@#$%^&(){}[\]:;<>,?~_+=|\\]/.test(password);

        if (password.length < minLength) {
            return "La contraseña debe tener al menos 8 caracteres.";
        }
        if (!hasNumber) {
            return "La contraseña debe contener al menos un número.";
        }
        if (!hasSpecialChar) {
            return "La contraseña debe contener al menos un carácter especial.";
        }
        return null;
    };

    const handleRegister = useCallback((data: FieldValues) => {
        const { username, password, email, university } = data as User;
        const passwordError = validatePassword(password);
        if (passwordError) {
            return toast.error(passwordError);
        }
        const hashedPassword = btoa(password); // Note: This is not secure, use a proper hashing algorithm in production
        const newUser = { username, password: hashedPassword, email, university };
        setUsers(prevUsers => [...prevUsers, newUser]);
        setCurrentUser(newUser);
        toast.success('Usuario registrado con éxito');
        setIsRegisterDialogOpen(false);
        reset();
    }, [reset]);

    const handleLogin = useCallback((data: FieldValues) => {
        const { username, password } = data as { username: string, password: string };
        const user = users.find(u => u.username === username && u.password === btoa(password));
        if (user) {
            setCurrentUser(user);
            setCurrentView('home');
            setIsLoginDialogOpen(false);
            toast.success('Inicio de sesión exitoso');
        } else {
            toast.error('Credenciales incorrectas');
        }
    }, [users]);

    const handleLogout = useCallback(() => {
        setCurrentUser(null)
        setCurrentView('home')
        toast.info('Sesión cerrada')
    }, [])

    const handleCreatePublication = useCallback((e: React.FormEvent) => {
        e.preventDefault()
        if (currentUser) {
            const fileInput = document.getElementById('pub-file') as HTMLInputElement
            const file = fileInput.files ? fileInput.files[0] : null
            if (file && file.type !== 'application/pdf') {
                toast.error('Solo se permiten archivos PDF.')
                return
            }
            const newPub: Publication = {
                ...newPublication,
                author: currentUser,
                id: Date.now().toString(),
                file: file || undefined,
                ratings: [],
                downloadCount: 0
            }
            setPublications(prevPublications => [...prevPublications, newPub])
            setNewPublication({ name: '', subject: '', university: '' })
            toast.success('Publicación creada con éxito')
        } else {
            toast.error('Debes iniciar sesión para crear una publicación')
        }
    }, [currentUser, newPublication])

    const handleEditProfile = useCallback((data: FieldValues) => {
        const { university, newPassword } = data as { university: string, newPassword?: string };
        if (currentUser) {
            const updatedUser = { ...currentUser, university };
            if (newPassword) {
                const passwordError = validatePassword(newPassword);
                if (passwordError) {
                    toast.error(passwordError);
                    return;
                }
                updatedUser.password = btoa(newPassword);
            }
            setUsers(prevUsers => prevUsers.map(u => u.username === currentUser.username ? updatedUser : u));
            setCurrentUser(updatedUser);
            toast.success('Perfil actualizado con éxito');
            setIsProfileDialogOpen(false);
        }
    }, [currentUser]);

    const handlePublicationClick = useCallback((publication: Publication) => {
        setSelectedPublication(publication)
    }, [])

    const handleAuthorClick = useCallback((author: User) => {
        setSelectedAuthor(author)
    }, [])

    const handleDownload = useCallback((publication: Publication) => {
        if (publication.file) {
            const url = URL.createObjectURL(publication.file)
            const a = document.createElement('a')
            a.href = url
            a.download = publication.file.name
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

            setPublications(prevPublications =>
                prevPublications.map(pub =>
                    pub.id === publication.id
                        ? { ...pub, downloadCount: pub.downloadCount + 1 }
                        : pub
                )
            )
        } else {
            toast.error('No hay archivo disponible para descargar')
        }
    }, [])

    const handleRate = useCallback((publicationId: string, rating: number) => {
        if (currentUser) {
            setPublications(publications.map(pub => {
                if (pub.id === publicationId) {
                    const existingRatingIndex = pub.ratings.findIndex(r => r.userId === currentUser.username)
                    if (existingRatingIndex !== -1) {
                        pub.ratings[existingRatingIndex].rating = rating
                    } else {
                        pub.ratings.push({ userId: currentUser.username, rating })
                    }
                }
                return pub
            }))
            toast.success('Calificación guardada')
        } else {
            toast.error('Debes iniciar sesión para calificar')
        }
    }, [currentUser, publications])

    const getAverageRating = useCallback((ratings: Rating[]) => {
        if (ratings.length === 0) return 0
        const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0)
        return sum / ratings.length
    }, [])

    useEffect(() => {
        const timer = setInterval(() => {
            setSliderIndex((prevIndex) => (prevIndex + 1) % sliderContent.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        if (currentUser) {
            setValue("username", currentUser.username)
            setValue("email", currentUser.email)
            setValue("university", currentUser.university)
        }
    }, [currentUser, setValue])

    const debouncedSearch = useCallback(
        debounce((term: string) => {
            setSearchTerm(term)
            setCurrentPage(1)
        }, 300),
        []
    )

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        debouncedSearch(e.target.value)
    }

    const filteredPublications = publications.filter(pub =>
        pub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pub.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pub.university.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const indexOfLastPublication = currentPage * publicationsPerPage
    const indexOfFirstPublication = indexOfLastPublication - publicationsPerPage
    const currentPublications = filteredPublications.slice(indexOfFirstPublication, indexOfLastPublication)

    const paginate = useCallback((pageNumber: number) => setCurrentPage(pageNumber), [])

    const featuredPublications = publications.filter(pub => pub.featured).slice(0, 3)

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            {/* Header */}
            <header className="w-full bg-primary text-primary-foreground py-4">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">UPBlioteca</h1>
                    <div className="flex items-center space-x-4">
                        {currentUser ? (
                            <>
                                <span className="flex items-center mr-2">
                                    <User className="mr-2 h-4 w-4" />
                                    Hola, {currentUser.username}
                                </span>
                                <Button
                                    onClick={() => setCurrentView(currentView === 'home' ? 'publications' : 'home')}
                                    className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                                >
                                    {currentView === 'home' ? 'Mis Publicaciones' : 'Inicio'}
                                </Button>
                                <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                                            <User className="mr-2 h-4 w-4" /> Perfil
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Perfil de Usuario</DialogTitle>
                                            <DialogDescription>
                                                Edita tu información de perfil en UPBlioteca.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleSubmit(handleEditProfile)}>
                                            <div className="grid gap-4 py-4">
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="profile-username" className="text-right">
                                                        Usuario
                                                    </Label>
                                                    <Input
                                                        id="profile-username"
                                                        value={currentUser.username}
                                                        className="col-span-3"
                                                        disabled
                                                    />
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="profile-email" className="text-right">
                                                        Email
                                                    </Label>
                                                    <Input
                                                        id="profile-email"
                                                        value={currentUser.email}
                                                        className="col-span-3"
                                                        disabled
                                                    />
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="profile-university" className="text-right">
                                                        Universidad
                                                    </Label>
                                                    <Input
                                                        id="profile-university"
                                                        {...register("university")}
                                                        defaultValue={currentUser.university}
                                                        className="col-span-3"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="profile-new-password" className="text-right">
                                                        Nueva Contraseña
                                                    </Label>
                                                    <Input
                                                        id="profile-new-password"
                                                        type="password"
                                                        {...register("newPassword", {
                                                            validate: (value) => !value || validatePassword(value) === null
                                                        })}
                                                        className="col-span-3"
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button type="submit">Guardar Cambios</Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                                <Button onClick={handleLogout} className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                                    Cerrar Sesión
                                </Button>
                            </>
                        ) : (
                            <>
                                <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">Registrarse</Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Registro</DialogTitle>
                                            <DialogDescription>
                                                Crea una nueva cuenta en UPBlioteca.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleSubmit(handleRegister)}>
                                            <div className="grid gap-4 py-4">
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="register-username" className="text-right">
                                                        Usuario
                                                    </Label>
                                                    <Input
                                                        id="register-username"
                                                        {...register("username", { required: true })}
                                                        className="col-span-3"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="register-password" className="text-right">
                                                        Contraseña
                                                    </Label>
                                                    <Input
                                                        id="register-password"
                                                        type="password"
                                                        {...register("password", {
                                                            required: true
                                                        })}
                                                        className="col-span-3"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="register-email" className="text-right">
                                                        Email
                                                    </Label>
                                                    <Input
                                                        id="register-email"
                                                        type="email"
                                                        {...register("email", { required: true, pattern: /^\S+@\S+$/i })}
                                                        className="col-span-3"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="register-university" className="text-right">
                                                        Universidad
                                                    </Label>
                                                    <Input
                                                        id="register-university"
                                                        {...register("university", { required: true })}
                                                        className="col-span-3"
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button type="submit" className="bg-primary hover:bg-primary/90">Registrarse</Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                                <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">Iniciar Sesión</Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Iniciar Sesión</DialogTitle>
                                            <DialogDescription>
                                                Ingresa a tu cuenta de UPBlioteca.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleSubmit(handleLogin)}>
                                            <div className="grid gap-4 py-4">
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="login-username" className="text-right">
                                                        Usuario
                                                    </Label>
                                                    <Input
                                                        id="login-username"
                                                        {...register("username", { required: true })}
                                                        className="col-span-3"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="login-password" className="text-right">
                                                        Contraseña
                                                    </Label>
                                                    <Input
                                                        id="login-password"
                                                        type="password"
                                                        {...register("password", { required: true })}
                                                        className="col-span-3"
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button type="submit" className="bg-primary hover:bg-primary/90">Iniciar Sesión</Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </>
                        )}
                    </div>
                </div>
            </header>
            {/* Main Content */}
            <main className="flex-grow container mx-auto px-4 py-8">
                <Card className="w-full bg-card shadow-lg mx-auto px-1 py-4">
                    <CardContent>
                        {currentView === 'home' ? (
                            <>
                                <div className="mb-8 relative">
                                    <div className="overflow-hidden rounded-lg bg-muted p-6" style={{ height: "calc(100% * 1.25)" }}>
                                        <h2 className="text-2xl font-bold text-primary mb-2">{sliderContent[sliderIndex].title}</h2>
                                        <p className="text-muted-foreground">{sliderContent[sliderIndex].description}</p>
                                    </div>
                                </div>
                                <div className="mb-8">
                                    <h3 className="text-xl font-semibold text-primary mb-4">Publicaciones destacadas</h3>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        {featuredPublications.map((pub) => (
                                            <Card key={pub.id} className="bg-card">
                                                <CardHeader>
                                                    <CardTitle className="text-primary flex items-center">
                                                        <Star className="h-5 w-5 text-primary mr-2" />
                                                        {pub.name}
                                                    </CardTitle>
                                                    <CardDescription className="text-muted-foreground">
                                                        {pub.subject} - {pub.university}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-primary">
                                                        Autor:
                                                        <Button
                                                            variant="link"
                                                            className="p-0 h-auto font-normal"
                                                            onClick={() => handleAuthorClick(pub.author)}
                                                        >
                                                            {pub.author.username}
                                                        </Button>
                                                    </p>
                                                    <div className="mt-2">
                                                        <StarRating
                                                            rating={getAverageRating(pub.ratings)}
                                                            onRate={(rating) => handleRate(pub.id, rating)}
                                                        />
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1">Descargas: {pub.downloadCount}</p>
                                                </CardContent>
                                                <CardFooter>
                                                    <Button
                                                        variant="outline"
                                                        className="mr-2"
                                                        onClick={() => handlePublicationClick(pub)}
                                                    >
                                                        <FileText className="mr-2 h-4 w-4" />
                                                        Ver documento
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => handleDownload(pub)}
                                                    >
                                                        <Download className="mr-2 h-4 w-4" />
                                                        Descargar
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                                <div className="mb-4 flex items-center">
                                    <Input
                                        type="text"
                                        placeholder="Buscar publicaciones..."
                                        onChange={handleSearchChange}
                                        className="flex-grow mr-2"
                                    />
                                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                        <Search className="h-4 w-4 mr-2" />
                                        Buscar
                                    </Button>
                                </div>
                                <h3 className="text-xl font-semibold text-primary mb-4">Documentos recientes</h3>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {currentPublications.map((pub) => (
                                        <Card key={pub.id} className="bg-card">
                                            <CardHeader>
                                                <CardTitle className="text-primary">{pub.name}</CardTitle>
                                                <CardDescription className="text-muted-foreground">
                                                    {pub.subject} - {pub.university}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-primary">
                                                    Autor:
                                                    <Button
                                                        variant="link"
                                                        className="p-0 h-auto font-normal"
                                                        onClick={() => handleAuthorClick(pub.author)}
                                                    >
                                                        {pub.author.username}
                                                    </Button>
                                                </p>
                                                <div className="mt-2">
                                                    <StarRating
                                                        rating={getAverageRating(pub.ratings)}
                                                        onRate={(rating) => handleRate(pub.id, rating)}
                                                    />
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">Descargas: {pub.downloadCount}</p>
                                            </CardContent>
                                            <CardFooter>
                                                <Button
                                                    variant="outline"
                                                    className="mr-2"
                                                    onClick={() => handlePublicationClick(pub)}
                                                >
                                                    <FileText className="mr-2 h-4 w-4" />
                                                    Ver documento
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => handleDownload(pub)}
                                                >
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Descargar
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                                <div className="mt-4 flex justify-center">
                                    {Array.from({ length: Math.ceil(filteredPublications.length / publicationsPerPage) }, (_, i) => (
                                        <Button
                                            key={i}
                                            onClick={() => paginate(i + 1)}
                                            className={`mx-1 ${currentPage === i + 1 ? 'bg-primary' : 'bg-secondary'}`}
                                        >
                                            {i + 1}
                                        </Button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            currentUser ? (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold text-primary">Crear nueva publicación</h3>
                                    <form onSubmit={handleCreatePublication} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="pub-name">Nombre del documento</Label>
                                            <Input
                                                id="pub-name"
                                                value={newPublication.name}
                                                onChange={(e) => setNewPublication({...newPublication, name: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="pub-subject">Materia</Label>
                                            <Input
                                                id="pub-subject"
                                                value={newPublication.subject}
                                                onChange={(e) => setNewPublication({...newPublication, subject: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="pub-university">Universidad</Label>
                                            <Input
                                                id="pub-university"
                                                value={newPublication.university}
                                                onChange={(e) => setNewPublication({...newPublication, university: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="pub-file">Archivo del documento (solo PDF)</Label>
                                            <Input
                                                id="pub-file"
                                                type="file"
                                                accept=".pdf"
                                                onChange={(e) => {
                                                    const file = e.target.files ? e.target.files[0] : null
                                                    if (file) {
                                                        if (file.type !== 'application/pdf') {
                                                            toast.error('Solo se permiten archivos PDF.')
                                                            e.target.value = ''
                                                        } else {
                                                            setNewPublication({...newPublication, file: file})
                                                        }
                                                    }
                                                }}
                                                required
                                            />
                                        </div>
                                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90">Crear Publicación</Button>
                                    </form>
                                    <div className="mt-6">
                                        <h3 className="text-xl font-semibold text-primary mb-4">Mis publicaciones</h3>
                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                            {publications.filter(pub => pub.author.username === currentUser.username).map((pub) => (
                                                <Card key={pub.id} className="bg-card">
                                                    <CardHeader>
                                                        <CardTitle className="text-primary">{pub.name}</CardTitle>
                                                        <CardDescription className="text-muted-foreground">
                                                            {pub.subject} - {pub.university}
                                                        </CardDescription>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="mt-2">
                                                            <StarRating
                                                                rating={getAverageRating(pub.ratings)}
                                                                onRate={(rating) => handleRate(pub.id, rating)}
                                                            />
                                                        </div>
                                                        <p className="text-sm text-muted-foreground mt-1">Descargas: {pub.downloadCount}</p>
                                                    </CardContent>
                                                    <CardFooter>
                                                        <Button
                                                            variant="outline"
                                                            className="mr-2"
                                                            onClick={() => handlePublicationClick(pub)}
                                                        >
                                                            <FileText className="mr-2 h-4 w-4" />
                                                            Ver documento
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => handleDownload(pub)}
                                                        >
                                                            <Download className="mr-2 h-4 w-4" />
                                                            Descargar
                                                        </Button>
                                                    </CardFooter>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-muted-foreground">Por favor, inicia sesión para ver y crear publicaciones.</p>
                            )
                        )}
                    </CardContent>
                </Card>
            </main>
            {/* Footer */}
            <footer className="bg-primary text-primary-foreground py-8">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Sobre UPBlioteca</h3>
                            <p className="text-sm">UPBlioteca es una plataforma para compartir y encontrar documentos de estudio entre estudiantes universitarios.</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Contacto</h3>
                            <p className="text-sm">Email: info@upblioteca.com</p>
                            <p className="text-sm">Teléfono: (123) 456-7890</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Enlaces rápidos</h3>
                            <ul className="text-sm">
                                <li><Link href="#" className="hover:underline">Términos de servicio</Link></li>
                                <li><Link href="#" className="hover:underline">Política de privacidad</Link></li>
                                <li><Link href="#" className="hover:underline">FAQ</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-8 text-center text-sm">
                        <p>&copy; 2024 UPBlioteca. Todos los derechos reservados.</p>
                    </div>
                </div>
            </footer>

            {/* Modal para mostrar la previsualización del documento */}
            {selectedPublication && (
                <Dialog open={!!selectedPublication} onOpenChange={() => setSelectedPublication(null)}>
                    <DialogContent className="sm:max-w-[800px]">
                        <DialogHeader>
                            <DialogTitle>{selectedPublication.name}</DialogTitle>
                            <DialogDescription>
                                {selectedPublication.subject} - {selectedPublication.university}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4">
                            <h4 className="font-semibold mb-2">Previsualización del documento:</h4>
                            {selectedPublication.file ? (
                                <div className="border rounded-lg overflow-hidden" style={{ height: '500px' }}>
                                    <iframe
                                        src={URL.createObjectURL(selectedPublication.file) + '#page=1&view=FitH'}
                                        title="Previsualización del documento"
                                        width="100%"
                                        height="100%"
                                        style={{ border: 'none' }}
                                    />
                                </div>
                            ) : (
                                <p>No hay archivo disponible para previsualizar.</p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button onClick={() => setSelectedPublication(null)}>Cerrar</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Modal para mostrar el perfil del autor */}
            {selectedAuthor && (
                <Dialog open={!!selectedAuthor} onOpenChange={() => setSelectedAuthor(null)}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Perfil de {selectedAuthor.username}</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                            <p><strong>Email:</strong> {selectedAuthor.email}</p>
                            <p><strong>Universidad:</strong> {selectedAuthor.university}</p>
                        </div>
                        <DialogFooter>
                            <Button onClick={() => setSelectedAuthor(null)}>Cerrar</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}