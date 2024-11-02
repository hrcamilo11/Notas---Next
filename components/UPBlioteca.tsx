'use client'

import React, {useState, useEffect, useCallback} from 'react'
import axios from 'axios';
import {useTranslation} from 'react-i18next'
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {User, Search, Star, FileText, Download, Edit, Globe} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import Link from 'next/link'
import '../i18n'

type User = {
    id:string
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


const API_BASE_URL = 'http://localhost:5000/api/users'; // endpoint usuarios



const StarRating = React.memo(({rating, onRate}: { rating: number, onRate: (rating: number) => void }) => {
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
    const {t, i18n} = useTranslation()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    const {register, handleSubmit, setValue, reset} = useForm()

    const [newPublication, setNewPublication] = useState<Omit<Publication, 'author' | 'id' | 'ratings' | 'downloadCount'>>({
        name: '',
        subject: '',
        university: '',
    })

    const validatePassword = (password: string) => {
        const minLength = 8;
        const hasNumber = /\d/.test(password);
        const hasSpecialChar = /[.*\-\/!@#$%^&(){}[\]:;<>,?~_+=|\\]/.test(password);

        if (password.length < minLength || !hasNumber || !hasSpecialChar) {
            return t('messages.passwordRequirements');
        }
        return null;
    };

    const handleRegister = useCallback(async (data: FieldValues) => {
        const { username, password, email, university } = data as User;
        const passwordError = validatePassword(password);
        if (passwordError) {
            return toast.error(passwordError);
        }
        const hashedPassword = btoa(password); // Recuerda que esto no es seguro

        try {
            const response = await axios.post(`${API_BASE_URL}/register`, {
                username,
                password: hashedPassword,
                email,
                university,
            });
            const newUser  = response.data;
            setUsers(prevUsers => [...prevUsers, newUser ]);
            setCurrentUser (newUser );
            toast.success(t('messages.registrationSuccess'));
            setIsRegisterDialogOpen(false);
            reset();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            toast.error(t('messages.registrationFailed'));
        }
    }, [reset, t]);

    const handleLogin = useCallback(async (data: FieldValues) => {
        const { username, password } = data as { username: string, password: string };
        const hashedPassword = btoa(password); // Recuerda que esto no es seguro

        try {
            const response = await axios.post(`${API_BASE_URL}/login`, {
                username,
                password: hashedPassword,
            });
            const user = response.data;
            setCurrentUser (user);
            setCurrentView('home');
            setIsLoginDialogOpen(false);
            toast.success(t('messages.loginSuccess'));
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            toast.error(t('messages.incorrectCredentials'));
        }
    }, [t]);

    const handleLogout = useCallback(() => {
        setCurrentUser (null);
        setCurrentView('home');
        toast.info(t('messages.sessionClosed'));
    }, [t]);

    const handleEditProfile = useCallback(async (data: FieldValues) => {
        const { university, newPassword } = data as { university: string, newPassword?: string };
        if (currentUser ) {
            const updatedUser  = { ...currentUser , university };
            if (newPassword) {
                const passwordError = validatePassword(newPassword);
                if (passwordError) {
                    toast.error(passwordError);
                    return;
                }
                updatedUser .password = btoa(newPassword); // Recuerda que esto no es seguro
            }

            try {
                await axios.put(`${API_BASE_URL}/${currentUser.id}`, updatedUser );
                setUsers(prevUsers => prevUsers.map(u => u.username === currentUser .username ? updatedUser  : u));
                setCurrentUser (updatedUser );
                toast.success(t('messages.profileUpdated'));
                setIsProfileDialogOpen(false);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
                toast.error(t('messages.profileUpdateFailed'));
            }
        }
    }, [currentUser , t]);

    const handleCreatePublication = useCallback((e: React.FormEvent) => {
        e.preventDefault()
        if (currentUser) {
            const fileInput = document.getElementById('pub-file') as HTMLInputElement
            const file = fileInput.files ? fileInput.files[0] : null
            if (file && file.type !== 'application/pdf') {
                toast.error(t('messages.pdfOnly'))
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
            setNewPublication({name: '', subject: '', university: ''})
            toast.success(t('messages.publicationCreated'))
        } else {
            toast.error(t('messages.loginRequired'))
        }
    }, [currentUser, newPublication, t])


    const handlePublicationClick = useCallback((publication: Publication) => {
        setSelectedPublication(publication)
    }, [])

    const handleAuthorClick = useCallback((author: User) => {
        setSelectedAuthor(author)
        setCurrentView('profile')
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
                        ? {...pub, downloadCount: pub.downloadCount + 1}
                        : pub
                )
            )
        } else {
            toast.error(t('messages.noFileToDownload'))
        }
    }, [t])

    const handleRate = useCallback((publicationId: string, rating: number) => {
        if (currentUser) {
            setPublications(publications.map(pub => {
                if (pub.id === publicationId) {
                    const existingRatingIndex = pub.ratings.findIndex(r => r.userId === currentUser.username)
                    if (existingRatingIndex !== -1) {
                        pub.ratings[existingRatingIndex].rating = rating
                    } else {
                        pub.ratings.push({userId: currentUser.username, rating})
                    }
                }
                return pub
            }))
            toast.success(t('messages.ratingSuccess'))
        } else {
            toast.error(t('messages.loginToRate'))
        }
    }, [currentUser, publications, t])

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

    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const sliderContent = [
        {title: t('slider.welcome'), description: t('slider.welcomeDescription')},
        {title: t('slider.shareNotes'), description: t('slider.shareNotesDescription')},
        {title: t('slider.findResources'), description: t('slider.findResourcesDescription')},
    ]

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
                                    {t('header.hello', {name: currentUser.username})}
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
                                <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
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
                                                        {...register("username", {required: true})}
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
                                                        {...register("email", {required: true, pattern: /^\S+@\S+$/i})}
                                                        className="col-span-3"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="register-university" className="text-right">
                                                        {t('dialogs.register.university')}
                                                    </Label>
                                                    <Input
                                                        id="register-university"
                                                        {...register("university", {required: true})}
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
                                                        {...register("username", {required: true})}
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
                                                        {...register("password", {required: true})}
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
                                <div className="mb-8 relative">
                                    <div className="overflow-hidden rounded-lg bg-muted p-6"
                                         style={{height: "calc(100% * 1.25)"}}>
                                        <h2 className="text-2xl font-bold text-primary mb-2">{sliderContent[sliderIndex].title}</h2>
                                        <p className="text-muted-foreground">{sliderContent[sliderIndex].description}</p>
                                    </div>
                                </div>
                                <div className="mb-8">
                                    <h3 className="text-xl font-semibold text-primary mb-4">{t('publications.featured')}</h3>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        {featuredPublications.map((pub) => (
                                            <Card key={pub.id} className="bg-card">
                                                <CardHeader>
                                                    <CardTitle className="text-primary flex items-center">
                                                        <Star className="h-5 w-5 text-primary mr-2"/>
                                                        {pub.name}
                                                    </CardTitle>
                                                    <CardDescription className="text-muted-foreground">
                                                        {pub.subject} - {pub.university}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-primary">
                                                        {t('publications.author')}:
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
                                    {Array.from({length: Math.ceil(filteredPublications.length / publicationsPerPage)}, (_, i) => (
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
                                                        setNewPublication({...newPublication, file: file})
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
                                <h3 className="text-xl font-semibold text-primary">{t('profile.title', {name: selectedAuthor.username})}</h3>
                                <div className="space-y-4">
                                    <p><strong>{t('profile.email')}:</strong> {selectedAuthor.email}</p>
                                    <p><strong>{t('profile.university')}:</strong> {selectedAuthor.university}</p>
                                </div>
                                {selectedAuthor.username === currentUser?.username && (
                                    <Button onClick={() => setIsProfileDialogOpen(true)}
                                            className="bg-primary hover:bg-primary/90">
                                        <Edit className="mr-2 h-4 w-4"/>
                                        {t('profile.updateData')}
                                    </Button>
                                )}
                                <h4 className="text-lg font-semibold text-primary mt-8">{t('profile.publications', {name: selectedAuthor.username})}</h4>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {publications.filter(pub => pub.author.username === selectedAuthor.username).map((pub) => (
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
                        )}
                    </CardContent>
                </Card>
            </main>
            {/* Footer */}
            <footer className="bg-primary text-primary-foreground py-8">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">{t('footer.about')}</h3>
                            <p className="text-sm">{t('footer.aboutDescription')}</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">{t('footer.contact')}</h3>
                            <p className="text-sm">Email: info@upblioteca.com</p>
                            <p className="text-sm">{t('footer.phone')}: (123) 456-7890</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">{t('footer.quickLinks')}</h3>
                            <ul className="text-sm">
                                <li><Link href="#" className="hover:underline">{t('footer.termsOfService')}</Link></li>
                                <li><Link href="#" className="hover:underline">{t('footer.privacyPolicy')}</Link></li>
                                <li><Link href="#" className="hover:underline">{t('footer.faq')}</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-8 text-center text-sm">
                        <p>&copy; 2024 UPBlioteca. {t('footer.rights')}</p>
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
                            <h4 className="font-semibold mb-2">{t('publications.preview')}:</h4>
                            {selectedPublication.file ? (
                                <div className="border rounded-lg overflow-hidden" style={{height: '500px'}}>
                                    <iframe
                                        src={URL.createObjectURL(selectedPublication.file) + '#page=1&view=FitH'}
                                        title={t('publications.preview')}
                                        width="100%"
                                        height="100%"
                                        style={{border: 'none'}}
                                    />
                                </div>
                            ) : (
                                <p>{t('messages.noFileToPreview')}</p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button onClick={() => setSelectedPublication(null)}>{t('common.close')}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Modal para actualizar el perfil */}
            <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{t('dialogs.updateProfile.title')}</DialogTitle>
                        <DialogDescription>
                            {t('dialogs.updateProfile.description')}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(handleEditProfile)}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="profile-username" className="text-right">
                                    {t('dialogs.updateProfile.username')}
                                </Label>
                                <Input
                                    id="profile-username"
                                    value={currentUser?.username}
                                    className="col-span-3"
                                    disabled
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="profile-email" className="text-right">
                                    {t('dialogs.updateProfile.email')}
                                </Label>
                                <Input
                                    id="profile-email"
                                    value={currentUser?.email}
                                    className="col-span-3"
                                    disabled
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="profile-university" className="text-right">
                                    {t('dialogs.updateProfile.university')}
                                </Label>
                                <Input
                                    id="profile-university"
                                    {...register("university")}
                                    defaultValue={currentUser?.university}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="profile-new-password" className="text-right">
                                    {t('dialogs.updateProfile.newPassword')}
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
                            <Button type="submit">{t('dialogs.updateProfile.submit')}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}