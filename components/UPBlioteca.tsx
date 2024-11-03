'use client'

import React, {useCallback, useEffect, useState} from 'react'
import axios from 'axios'
import {useTranslation} from 'react-i18next'
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {Download, Edit, FileText, Globe, Search, Star, User} from 'lucide-react'
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import {FieldValues, useForm} from 'react-hook-form'
import {toast, ToastContainer} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {debounce} from 'lodash'
import '../i18n'

type User = {
    id: string
    username: string
    email: string
    university: string
    password: string
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
    author: User | null
    featured?: boolean
    file?: File
    ratings: Rating[]
    downloadCount: number
}

const API_USER = 'http://localhost:5000/api/users'
const API_PUBLICATION = 'http://localhost:5000/api/publications'

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
    const { t, i18n } = useTranslation()
    const [publications, setPublications] = useState<Publication[]>([])
    const [currentUser, setCurrentUser] = useState<User | null>(null)
    const [currentView, setCurrentView] = useState('home')
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
        const minLength = 8
        const hasNumber = /\d/.test(password)
        const hasSpecialChar = /[.*\-\/!@#$%^&(){}[\]:;<>,?~_+=|\\]/.test(password)

        if (password.length < minLength || !hasNumber || !hasSpecialChar) {
            return t('messages.passwordRequirements')
        }
        return null
    }

    const handleRegister = useCallback(async (data: FieldValues) => {
        const { username, password, email, university } = data as User
        const passwordError = validatePassword(password)
        if (passwordError) {
            return toast.error(passwordError)
        }

        try {
            const response = await axios.post(`${API_USER}/register`, {
                username,
                password,
                email,
                university,
            })
            const newUser = response.data.user
            setCurrentUser(newUser)
            toast.success(t('messages.registrationSuccess'))
            setIsRegisterDialogOpen(false)
            reset()
        } catch (error) {
            toast.error(t('messages.registrationFailed'))
            console.error(error)
        }
    }, [reset, t])

    const handleLogin = useCallback(async (data: FieldValues) => {
        const { username, password } = data as { username: string, password: string }

        try {
            const response = await axios.post(`${API_USER}/login`, {
                username,
                password,
            })
            const { user, token } = response.data
            setCurrentUser(user)
            localStorage.setItem('token', token)
            setCurrentView('home')
            setIsLoginDialogOpen(false)
            toast.success(t('messages.loginSuccess'))
            reset()
        } catch (error) {
            toast.error(t('messages.incorrectCredentials'))
        }
    }, [t])

    const handleLogout = useCallback(() => {
        setCurrentUser(null)
        localStorage.removeItem('token')
        setCurrentView('home')
        toast.info(t('messages.sessionClosed'))
    }, [t])

    const handleEditProfile = useCallback(async (data: FieldValues) => {
        const { university, newPassword } = data as { university: string, newPassword?: string }
        if (currentUser) {
            const updatedFields: Partial<User> = { university }
            if (newPassword) {
                const passwordError = validatePassword(newPassword)
                if (passwordError) {
                    toast.error(passwordError)
                    return
                }
                updatedFields.password = newPassword
            }

            try {
                const response = await axios.put(`${API_USER}/${currentUser.id}`, updatedFields, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                })
                const updatedUser = response.data.user
                setCurrentUser(updatedUser)
                toast.success(t('messages.profileUpdated'))
                setIsProfileDialogOpen(false)
            } catch (error) {
                toast.error(t('messages.profileUpdateFailed'))
            }
        }
    }, [currentUser, t])

    const handleCreatePublication = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()
        if (currentUser) {
            const fileInput = document.getElementById('pub-file') as HTMLInputElement
            const file = fileInput.files ? fileInput.files[0] : null
            if (file && file.type !== 'application/pdf') {
                toast.error(t('messages.pdfOnly'))
                return
            }
            const formData = new FormData()
            formData.append('name', newPublication.name)
            formData.append('subject', newPublication.subject)
            formData.append('university', newPublication.university)
            formData.append('authorId', currentUser.id)
            if (file) {
                formData.append('file', file)
            }
            try {
                const response = await axios.post(API_PUBLICATION, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                })
                const newPub = response.data
                setPublications(prevPublications => [...prevPublications, newPub])
                setNewPublication({ name: '', subject: '', university: '' })
                toast.success(t('messages.publicationCreated'))
            } catch (error) {
                toast.error(t('messages.publicationCreationFailed'))
            }
        } else {
            toast.error(t('messages.loginRequired'))
        }
    }, [currentUser, newPublication, t])

    const handlePublicationClick = useCallback((publication: Publication) => {
        setSelectedPublication(publication)
    }, [])

    const handleAuthorClick = useCallback((author: User | null) => {
        if (author) {
            setSelectedAuthor(author)
            setCurrentView('profile')
        } else {
            toast.error(t('messages.authorNotAvailable'))
        }
    }, [t])

    const handleDownload = useCallback(async (publication: Publication) => {
        try {
            await axios.post(`${API_PUBLICATION}/${publication.id}/download`)
            setPublications(prevPublications =>
                prevPublications.map(pub =>
                    pub.id === publication.id
                        ? { ...pub, downloadCount: pub.downloadCount + 1 }
                        : pub
                )
            )
            // Aquí iría la lógica para descargar el archivo
            toast.success(t('messages.downloadStarted'))
        } catch (error) {
            toast.error(t('messages.downloadFailed'))
        }
    }, [t])

    const handleRate = useCallback(async (publicationId: string, rating: number) => {
        if (currentUser) {
            try {
                await axios.post(`${API_PUBLICATION}/${publicationId}/rate`, { userId: currentUser.id, rating }, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                })
                setPublications(publications.map(pub => {
                    if (pub.id === publicationId) {
                        const existingRatingIndex = pub.ratings.findIndex(r => r.userId === currentUser.id)
                        if (existingRatingIndex !== -1) {
                            pub.ratings[existingRatingIndex].rating = rating
                        } else {
                            pub.ratings.push({ userId: currentUser.id, rating })
                        }
                    }
                    return pub
                }))
                toast.success(t('messages.ratingSuccess'))
            } catch (error) {
                toast.error(t('messages.ratingFailed'))
            }
        } else {
            toast.error(t('messages.loginToRate'))
        }
    }, [currentUser, publications, t])

    const getAverageRating = useCallback((ratings: Rating[]) => {
        if (ratings.length === 0) return 0
        const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0)
        return sum / ratings.length
    }, [])

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

    const featuredPublications = publications
        .filter(pub => pub.featured && pub.author)
        .slice(0, 3)

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng)
    }

    useEffect(() => {
        const fetchPublications = async () => {
            try {
                const response = await axios.get(API_PUBLICATION)
                setPublications(response.data)
            } catch (error) {
                toast.error(t('messages.failedToFetchPublications'))
            }
        }

        fetchPublications()
    }, [t])

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false}
                            closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover/>
            {/* Header */}
            <header className="w-full bg-primary text-primary-foreground py-4">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">{t('header.title')}</h1>
                    <div className="flex items-center space-x-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                                >
                                    <Globe className="h-4 w-4"/>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => changeLanguage('es')}>
                                    Español
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => changeLanguage('en')}>
                                    English
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => changeLanguage('fr')}>
                                    Français
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        {currentUser ? (
                            <>
                                <span className="flex items-center mr-2">
                                  <User className="mr-2 h-4 w-4"/>
                                    {t('header.hello', { name: currentUser.username })}
                                </span>
                                <Button
                                    onClick={() => setCurrentView(currentView === 'home' ? 'publications' : 'home')}
                                    className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                                >
                                    {currentView === 'home' ? t('header.myPublications') : t('header.home')}
                                </Button>
                                <Button
                                    onClick={() => handleAuthorClick(currentUser)}
                                    className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                                >
                                    {t('header.myProfile')}
                                </Button>
                                <Button onClick={handleLogout}
                                        className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                                    {t('header.logout')}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Dialog  open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button
                                            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">{t('header.register')}</Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>{t('dialogs.register.title')}</DialogTitle>
                                            <DialogDescription>
                                                {t('dialogs.register.description')}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleSubmit(handleRegister)}>
                                            <div className="grid gap-4 py-4">
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="register-username" className="text-right">
                                                        {t('dialogs.register.username')}
                                                    </Label>
                                                    <Input
                                                        id="register-username"
                                                        {...register("username", { required: true })}
                                                        className="col-span-3"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="register-password" className="text-right">
                                                        {t('dialogs.register.password')}
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
                                                        {t('dialogs.register.email')}
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
                                                        {t('dialogs.register.university')}
                                                    </Label>
                                                    <Input
                                                        id="register-university"
                                                        {...register("university", { required: true })}
                                                        className="col-span-3"
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button type="submit"
                                                        className="bg-primary hover:bg-primary/90">{t('dialogs.register.submit')}</Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                                <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button
                                            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">{t('header.login')}</Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>{t('dialogs.login.title')}</DialogTitle>
                                            <DialogDescription>
                                                {t('dialogs.login.description')}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleSubmit(handleLogin)}>
                                            <div className="grid gap-4 py-4">
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="login-username" className="text-right">
                                                        {t('dialogs.login.username')}
                                                    </Label>
                                                    <Input
                                                        id="login-username"
                                                        {...register("username", { required: true })}
                                                        className="col-span-3"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="login-password" className="text-right">
                                                        {t('dialogs.login.password')}
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
                                                <Button type="submit"
                                                        className="bg-primary hover:bg-primary/90">{t('dialogs.login.submit')}</Button>
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
                        {currentView === 'home' && (
                            <>
                                <div className="mb-4 flex items-center">
                                    <Input
                                        type="text"
                                        placeholder={t('publications.search')}
                                        onChange={handleSearchChange}
                                        className="flex-grow mr-2"
                                    />
                                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                        <Search className="h-4 w-4 mr-2"/>
                                        {t('publications.searchButton')}
                                    </Button>
                                </div>
                                <h3 className="text-xl font-semibold text-primary mb-4">{t('publications.recent')}</h3>
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
                                                    {t('publications.author')}:
                                                    {pub.author ? (
                                                        <Button
                                                            variant="link"
                                                            className="p-0 h-auto font-normal"
                                                            onClick={() => handleAuthorClick(pub.author)}
                                                        >
                                                            {pub.author.username}
                                                        </Button>
                                                    ) : (
                                                        <span className="text-muted-foreground">{t('publications.unknownAuthor')}</span>
                                                    )}
                                                </p>
                                                <div className="mt-2">
                                                    <StarRating
                                                        rating={getAverageRating(pub.ratings)}
                                                        onRate={(rating) => handleRate(pub.id, rating)}
                                                    />
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">{t('publications.downloads')}: {pub.downloadCount}</p>
                                            </CardContent>
                                            <CardFooter>
                                                <Button
                                                    variant="outline"
                                                    className="mr-2"
                                                    onClick={() => handlePublicationClick(pub)}
                                                >
                                                    <FileText className="mr-2 h-4 w-4"/>
                                                    {t('publications.viewDocument')}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => handleDownload(pub)}
                                                >
                                                    <Download className="mr-2 h-4 w-4"/>
                                                    {t('publications.download')}
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
                        )}
                        {currentView === 'publications' && currentUser && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold text-primary">{t('createPublication.title')}</h3>
                                <form onSubmit={handleCreatePublication} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="pub-name">{t('createPublication.name')}</Label>
                                        <Input
                                            id="pub-name"
                                            value={newPublication.name}
                                            onChange={(e) => setNewPublication({
                                                ...newPublication,
                                                name: e.target.value
                                            })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="pub-subject">{t('createPublication.subject')}</Label>
                                        <Input
                                            id="pub-subject"
                                            value={newPublication.subject}
                                            onChange={(e) => setNewPublication({
                                                ...newPublication,
                                                subject: e.target.value
                                            })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="pub-university">{t('createPublication.university')}</Label>
                                        <Input
                                            id="pub-university"
                                            value={newPublication.university}
                                            onChange={(e) => setNewPublication({
                                                ...newPublication,
                                                university: e.target.value
                                            })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="pub-file">{t('createPublication.file')}</Label>
                                        <Input
                                            id="pub-file"
                                            type="file"
                                            accept=".pdf"
                                            onChange={(e) => {
                                                const file = e.target.files ? e.target.files[0] : null
                                                if (file) {
                                                    if (file.type !== 'application/pdf') {
                                                        toast.error(t('messages.pdfOnly'))
                                                        e.target.value = ''
                                                    } else {
                                                        setNewPublication({ ...newPublication, file: file })
                                                    }
                                                }
                                            }}
                                            required
                                        />
                                    </div>
                                    <Button type="submit"
                                            className="w-full bg-primary hover:bg-primary/90">{t('createPublication.submit')}</Button>
                                </form>
                                <div className="mt-6">
                                    <h3 className="text-xl font-semibold text-primary mb-4">{t('publications.myPublications')}</h3>
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {publications.filter(pub => pub.author && pub.author.id === currentUser.id).map((pub) => (
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
                                                    <p className="text-sm text-muted-foreground mt-1">{t('publications.downloads')}: {pub.downloadCount}</p>
                                                </CardContent>
                                                <CardFooter>
                                                    <Button
                                                        variant="outline"
                                                        className="mr-2"
                                                        onClick={() => handlePublicationClick(pub)}
                                                    >
                                                        <FileText className="mr-2 h-4 w-4"/>
                                                        {t('publications.viewDocument')}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => handleDownload(pub)}
                                                    >
                                                        <Download className="mr-2 h-4 w-4"/>
                                                        {t('publications.download')}
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        {currentView === 'profile' && selectedAuthor && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold text-primary">{t('profile.title', { name: selectedAuthor.username })}</h3>
                                <p className="text-muted-foreground">{t('profile.university')}: {selectedAuthor.university}</p>
                                <h4 className="text-lg font-semibold text-primary">{t('profile.publications')}</h4>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {publications.filter(pub => pub.author && pub.author.id === selectedAuthor.id).map((pub) => (
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
                                                        onRate={(rating) => handleRate(pub.id,rating)}
                                                    />
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">{t('publications.downloads')}: {pub.downloadCount}</p>
                                            </CardContent>
                                            <CardFooter>
                                                <Button
                                                    variant="outline"
                                                    className="mr-2"
                                                    onClick={() => handlePublicationClick(pub)}
                                                >
                                                    <FileText className="mr-2 h-4 w-4"/>
                                                    {t('publications.viewDocument')}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => handleDownload(pub)}
                                                >
                                                    <Download className="mr-2 h-4 w-4"/>
                                                    {t('publications.download')}
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                                {selectedAuthor.id === currentUser?.id && (
                                    <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button className="mt-4 bg-primary hover:bg-primary/90">
                                                <Edit className="mr-2 h-4 w-4"/>
                                                {t('profile.edit')}
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                                <DialogTitle>{t('dialogs.editProfile.title')}</DialogTitle>
                                                <DialogDescription>
                                                    {t('dialogs.editProfile.description')}
                                                </DialogDescription>
                                            </DialogHeader>
                                            <form onSubmit={handleSubmit(handleEditProfile)}>
                                                <div className="grid gap-4 py-4">
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <Label htmlFor="edit-username" className="text-right">
                                                            {t('dialogs.editProfile.username')}
                                                        </Label>
                                                        <Input
                                                            id="edit-username"
                                                            {...register("username")}
                                                            className="col-span-3"
                                                            disabled
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <Label htmlFor="edit-email" className="text-right">
                                                            {t('dialogs.editProfile.email')}
                                                        </Label>
                                                        <Input
                                                            id="edit-email"
                                                            type="email"
                                                            {...register("email")}
                                                            className="col-span-3"
                                                            disabled
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <Label htmlFor="edit-university" className="text-right">
                                                            {t('dialogs.editProfile.university')}
                                                        </Label>
                                                        <Input
                                                            id="edit-university"
                                                            {...register("university")}
                                                            className="col-span-3"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <Label htmlFor="edit-new-password" className="text-right">
                                                            {t('dialogs.editProfile.newPassword')}
                                                        </Label>
                                                        <Input
                                                            id="edit-new-password"
                                                            type="password"
                                                            {...register("newPassword")}
                                                            className="col-span-3"
                                                        />
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button type="submit"
                                                            className="bg-primary hover:bg-primary/90">{t('dialogs.editProfile.submit')}</Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
            {/* Footer */}
            <footer className="w-full bg-primary text-primary-foreground py-4 mt-8">
                <div className="container mx-auto px-4 text-center">
                    <p>&copy; 2023 UPBlioteca. {t('footer.rights')}</p>
                </div>
            </footer>
            {/* Modals */}
            <Dialog open={!!selectedPublication} onOpenChange={() => setSelectedPublication(null)}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{selectedPublication?.name}</DialogTitle>
                        <DialogDescription>
                            {selectedPublication?.subject} - {selectedPublication?.university}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-primary mb-2">
                            {t('publications.author')}:
                            {selectedPublication?.author ? (
                                <Button
                                    variant="link"
                                    className="p-0 h-auto font-normal"
                                    onClick={() => {
                                        setSelectedPublication(null)
                                        handleAuthorClick(selectedPublication.author)
                                    }}
                                >
                                    {selectedPublication.author.username}
                                </Button>
                            ) : (
                                <span className="text-muted-foreground">{t('publications.unknownAuthor')}</span>
                            )}
                        </p>
                        <StarRating
                            rating={getAverageRating(selectedPublication?.ratings || [])}
                            onRate={(rating) => selectedPublication && handleRate(selectedPublication.id, rating)}
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                            {t('publications.downloads')}: {selectedPublication?.downloadCount}
                        </p>
                        {/* Aquí iría el visor de PDF */}
                        <div className="mt-4 bg-muted p-4 rounded">
                            {t('publications.pdfViewer')}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedPublication(null)}>
                            {t('publications.close')}
                        </Button>
                        <Button onClick={() => selectedPublication && handleDownload(selectedPublication)}>
                            <Download className="mr-2 h-4 w-4"/>
                            {t('publications.download')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}