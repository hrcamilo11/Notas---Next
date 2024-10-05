"use client"

import { useState, useEffect, AwaitedReactNode, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, SetStateAction} from "react"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {
  CalendarDays,
  Package,
  Scissors,
  Search,
  ShoppingBag,
  Users,
  Plus,
  RefreshCw,
  X,
  Clock,
  LogOut,
  Eye,
  EyeOff,
  Bell
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Checkbox} from "@/components/ui/checkbox"
import {Progress} from "@/components/ui/progress"
import {toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'


type User = {
  id: number
  username: string
  password: string
  role: 'admin' | 'employee' | 'client'
}

type Notification = {
  id: number
  type: 'password_change' | 'order_delayed' | 'unassigned_order'
  message: string
  createdAt: Date
  read: boolean
}

type AuthProps = {
  onLogin: (user: User) => void
  onRegister: (username: string, password: string) => void
  onPasswordRecovery: (username: string) => void
  users: User[]
}

interface Order {
  id: number;
  client: string;
  product: string;
  quantity: number;
  dueDate: Date;
  deliveredDate: Date;
}

const subtasks = ['Cortado', 'Bordado', 'Cosido', 'Armado', 'Control de calidad', 'Empaquetado']


function Auth({onLogin, onRegister, onPasswordRecovery, users}: AuthProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [recoveryUsername, setRecoveryUsername] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const user = users.find(u => u.username === username && u.password === password)
    if (user) {
      onLogin(user)
      toast.dark("Bienvenido " + user.username)
    } else {
      toast.error("Por favor, verifica tu nombre de usuario y contraseña.")
    }
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    if (users.some(u => u.username === username)) {
      toast.error("El nombre de usuario ya existe. Por favor, elija otro.")
    } else {
      onRegister(username, password)
      setActiveTab("login")
      toast.success("Por favor, inicie sesión con sus nuevas credenciales.")
    }
  }

  const handlePasswordRecovery = (e: React.FormEvent) => {
    e.preventDefault()
    onPasswordRecovery(recoveryUsername)
    setRecoveryUsername("")
    toast.success("Solicitud de recuperación enviada")
    toast.info("Un empleado enviará tu nueva contraseña a través de un mensaje o correo electrónico.")
  }

  return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Tracktext</CardTitle>
            <CardDescription>Inicie sesión o regístrese para continuar</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="register">Registrarse</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={handleLogin}>
                  <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="username">Usuario</Label>
                      <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)}/>
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="password">Contraseña</Label>
                      <Input id="password" type="password" value={password}
                             onChange={(e) => setPassword(e.target.value)}/>
                    </div>
                  </div>
                  <Button className="w-full mt-4" type="submit">Iniciar Sesión</Button>
                </form>
                <div className="mt-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="link" className="w-full">¿Olvidaste tu contraseña?</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Recuperar Contraseña</DialogTitle>
                        <DialogDescription>
                          Ingresa tu nombre de usuario para solicitar una nueva contraseña.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handlePasswordRecovery}>
                        <div className="grid w-full items-center gap-4">
                          <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="recovery-username">Nombre de Usuario</Label>
                            <Input
                                id="recovery-username"
                                value={recoveryUsername}
                                onChange={(e) => setRecoveryUsername(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter className="mt-4">
                          <Button type="submit">Solicitar Nueva Contraseña</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </TabsContent>
              <TabsContent value="register">
                <form onSubmit={handleRegister}>
                  <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="register-username">Usuario</Label>
                      <Input id="register-username" value={username} onChange={(e) => setUsername(e.target.value)}/>
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="register-password">Contraseña</Label>
                      <Input id="register-password" type="password" value={password}
                             onChange={(e) => setPassword(e.target.value)}/>
                    </div>
                  </div>
                  <Button className="w-full mt-4" type="submit">Registrarse</Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
  )
}

// @ts-ignore
function Notifications({notifications, onMarkAsRead}) {
  return (
      <Card>
        <CardHeader>
          <CardTitle>Notificaciones</CardTitle>
          <CardDescription>Gestiona las notificaciones del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
              <p>No hay notificaciones nuevas.</p>
          ) : (
              <ul className="space-y-4">
                {notifications.map((notification: {
                  id: Key | null | undefined;
                  message: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined;
                  createdAt: {
                    toLocaleString: () => string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined
                  };
                  read: any
                }) => (
                    <li key={notification.id} className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                      <div>
                        <p className="font-medium">{notification.message}</p>
                        <p className="text-sm text-gray-500">
                          {notification.createdAt.toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && (
                          <Button onClick={() => onMarkAsRead(notification.id)}>
                            Marcar como leída
                          </Button>
                      )}
                    </li>
                ))}
              </ul>
          )}
        </CardContent>
      </Card>
  )
}

export default function TextileDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([
    {id: 1, username: "admin", password: "admin", role: "admin"},
    {id: 2, username: "employee", password: "employee", role: "employee"},
    {id: 3, username: "client", password: "client", role: "client"},
  ])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [activeSection, setActiveSection] = useState("pedidos")
  const [orders, setOrders] = useState([

    {
      id: 1,
      client: "client",
      product: "Vestidos",
      quantity: 75,
      status: "Completado",
      dueDate: "2024-03-10",
      progress: {
        Cortado: {completed: 75},
        Bordado: {completed: 75},
        Cosido: {completed: 75},
        Armado: {completed: 75},
        'Control de calidad': {completed: 75},
        Empaquetado: {completed: 75},
      }
    },
  ])
  const [filteredOrders, setFilteredOrders] = useState(orders)
  const [searchTerm, setSearchTerm] = useState("")
  const [newClient, setNewClient] = useState({username: "", password: ""})
  const [newEmployee, setNewEmployee] = useState({username: "", password: ""})
  const [newOrder, setNewOrder] = useState({
    product: "",
    quantity: "",
    dueDate: "",
    subtasks: subtasks.reduce((acc, task) => ({...acc, [task]: false}), {}),
  })
  const [deliveredOrders, setDeliveredOrders] = useState([])
  const [showPasswords, setShowPasswords] = useState<{ [key: number]: boolean }>({})
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    // Check for delayed orders and create notifications
    const today = new Date()
    const delayedOrders = orders.filter(order => new Date(order.dueDate) < today && order.status !== "Completado")
    delayedOrders.forEach(order => {
      createNotification('order_delayed', `El pedido #${order.id} está retrasado.`)
    })

    // Check for unassigned orders in production
    const unassignedOrders = orders.filter(order => !order.client && order.status === "En producción")
    unassignedOrders.forEach(order => {
      createNotification('unassigned_order', `El pedido #${order.id} está en producción pero no tiene cliente asignado.`)
    })
  }, [orders])

  const createNotification = (type: 'password_change' | 'order_delayed' | 'unassigned_order', message: string) => {
    const newNotification: Notification = {
      id: notifications.length + 1,
      type,
      message,
      createdAt: new Date(),
      read: false,
    }
    setNotifications(prev => [...prev, newNotification])
  }

  const handleMarkNotificationAsRead = (id: number) => {
    setNotifications(prev => prev.map(notif =>
        notif.id === id ? {...notif, read: true} : notif
    ))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pendiente":
        return "bg-yellow-500"
      case "En producción":
        return "bg-blue-500"
      case "Completado":
        return "bg-green-500"
      case "Entregado":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser)
    setActiveSection("pedidos")
  }

  const handleRegister = (username: string, password: string) => {
    const newUser: User = {
      id: users.length + 1,
      username,
      password,
      role: "client"
    }
    setUsers([...users, newUser])
    toast.success("Registro exitoso")
    toast.info("Se ha creado una nueva cuenta de cliente. Por favor, inicie sesión.")
  }

  const handlePasswordRecovery = (username: string) => {
    const user = users.find(u => u.username === username)
    if (user) {
      createNotification('password_change', `El usuario ${username} ha solicitado un cambio de contraseña.`)
    } else {
      toast.error("Error de recuperación")
      toast.info("No se encontró ningún usuario con ese nombre.")
    }
  }

  const handleLogout = () => {
    setUser(null)
    setActiveSection("pedidos")
  }

  const handleSectionChange = (section: SetStateAction<string>) => {
    setActiveSection(section)
    setSelectedOrder(null)
  }

  const handleOrderSelect = (order: SetStateAction<null>) => {
    setSelectedOrder(order)
  }

  const handleStatusUpdate = (orderId: number, newStatus: string) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    )
    setOrders(updatedOrders)
    setFilteredOrders(updatedOrders)
    // @ts-ignore
    if (selectedOrder && selectedOrder.id === orderId) {
      // @ts-ignore
      setSelectedOrder({ ...selectedOrder, status: newStatus })
    }
  }

  const handleSearch = (event: { target: { value: string } }) => {
    const term = event.target.value.toLowerCase()
    setSearchTerm(term)
    const filtered = orders.filter(order =>
      (order.client?.toLowerCase().includes(term) || '') ||
      order.product.toLowerCase().includes(term) ||
      order.id.toString().includes(term)
    )
    setFilteredOrders(filtered)
  }

  const handleFilter = (status: string) => {
    if (status === "todos") {
      setFilteredOrders(orders)
    } else {
      const filtered = orders.filter(order => order.status.toLowerCase() === status)
      setFilteredOrders(filtered)
    }
  }

  const handleNewClientChange = (e: { target: { name: any; value: any } }) => {
    setNewClient({ ...newClient, [e.target.name]: e.target.value })
  }

  const handleNewClientSubmit = () => {
    const newId = users.length + 1
    const newClientUser: User = {
      id: newId,
      username: newClient.username,
      password: newClient.password,
      role: "client"
    }
    setUsers([...users, newClientUser])
    setNewClient({ username: "", password: "" })
    toast.success("Cliente creado")
    toast.info("Se ha creado un nuevo cliente exitosamente.")
  }

  const handleNewEmployeeChange = (e: { target: { name: any; value: any } }) => {
    setNewEmployee({ ...newEmployee, [e.target.name]: e.target.value })
  }

  const handleNewEmployeeSubmit = () => {
    const newId = users.length + 1
    const newEmployeeUser: User = {
      id: newId,
      username: newEmployee.username,
      password: newEmployee.password,
      role: "employee"
    }
    setUsers([...users, newEmployeeUser])
    setNewEmployee({ username: "", password: "" })
    toast.success("Empleado creado")
    toast.info("Se ha creado un nuevo empleado exitosamente.")
  }

  const handleEmployeeDelete = (employeeId: number) => {
    setUsers(users.filter(user => user.id !== employeeId || user.role !== "employee"))
    toast.warning("Empleado eliminado")
    toast.info("Se ha eliminado el empleado exitosamente.")
  }

  const handleNewOrderChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target
    setNewOrder({ ...newOrder, [name]: value })
  }

  const handleSubtaskToggle = (subtask: string) => {

    setNewOrder({
      ...newOrder,
      subtasks: {
        ...newOrder.subtasks,
        // @ts-ignore
        [subtask]: !newOrder.subtasks[subtask],
      },
    })
  }

  const handleNewOrderSubmit = () => {
    const today = new Date()
    const dueDate = new Date(newOrder.dueDate)

    if (dueDate < today) {
      toast.error("Error al crear pedido")
      toast.info("La fecha de entrega no puede ser anterior a la fecha actual.")
      return
    }

    const newId = orders.length + 1
    const newOrderWithId = {
      ...newOrder,
      id: newId,
      client: user?.role === 'client' ? user.username : null,
      status: "Pendiente",
      progress: Object.fromEntries(
        Object.entries(newOrder.subtasks)
          .map(([key]) => [key, { completed: 0 }])
      ),
    }
    // @ts-ignore
    setOrders([...orders, newOrderWithId])
    // @ts-ignore
    setFilteredOrders([...orders, newOrderWithId])
    setNewOrder({
      product: "",
      quantity: "",
      dueDate: "",
      subtasks: subtasks.reduce((acc, task) => ({ ...acc, [task]: false }), {}),
    })
    toast.success("Pedido creado")
    toast.info("Se ha creado un nuevo pedido exitosamente.")
  }

  const handleSubtaskUpdate = (orderId: number, subtask: string, completed: string) => {
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          progress: {
            ...order.progress,
            [subtask]: {
              completed: parseInt(completed, 10),
              percentage: (parseInt(completed, 10) / order.quantity) * 100
            }
          }
        }
      }
      return order
    })
    setOrders(updatedOrders)
    setFilteredOrders(updatedOrders)
    // @ts-ignore
    if (selectedOrder && selectedOrder.id === orderId) {
      // @ts-ignore
      setSelectedOrder(updatedOrders.find(order => order.id === orderId))
    }
  }

  const handleMarkAsDelivered = (orderId: number) => {
    const orderToDeliver = orders.find(order => order.id === orderId)
    if (orderToDeliver) {
      const updatedOrder = { ...orderToDeliver, status: "Entregado", deliveredDate: new Date().toISOString() }
      // @ts-ignore
      setDeliveredOrders([...deliveredOrders, updatedOrder])
      const updatedOrders = orders.filter(order => order.id !== orderId)
      setOrders(updatedOrders)
      setFilteredOrders(updatedOrders)

      toast.success("Pedido entregado")
      toast.info(`El pedido #${orderId} ha sido marcado como entregado.`)
    }
  }

  const togglePasswordVisibility = (id: number) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleAssignOrder = (clientId: number, orderId: number) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, client: users.find(u => u.id === clientId)?.username } : order
    )
    // @ts-ignore
    setOrders(updatedOrders)
    // @ts-ignore
    setFilteredOrders(updatedOrders)
    toast.success("Pedido asignado")
    toast.info(`El pedido #${orderId} ha sido asignado exitosamente al cliente ${clientId.username}.`)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
  }

  if (!user) {
    return <Auth onLogin={handleLogin} onRegister={handleRegister} onPasswordRecovery={handlePasswordRecovery} users={users} />
  }

  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Barra lateral */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">Tracktext</h2>
          <nav>
            <Button
              variant={activeSection === "pedidos" ? "default" : "ghost"}
              className="w-full justify-start mb-2"
              onClick={() => handleSectionChange("pedidos")}
            >
              <Package className="mr-2 h-4 w-4" /> Pedidos
            </Button>
            {(user.role === 'admin' || user.role === 'employee') && (
              <Button
                variant={activeSection === "clientes" ? "default" : "ghost"}
                className="w-full justify-start mb-2"
                onClick={() => handleSectionChange("clientes")}
              >
                <Users className="mr-2 h-4 w-4" /> Clientes
              </Button>
            )}
            {(user.role === 'admin' || user.role === 'employee') && (
              <Button
                variant={activeSection === "produccion" ? "default" : "ghost"}
                className="w-full justify-start mb-2"
                onClick={() => handleSectionChange("produccion")}
              >
                <Scissors className="mr-2 h-4 w-4" /> Producción
              </Button>
            )}
            {(user.role === 'admin' || user.role === 'employee') && (
              <Button
                variant={activeSection === "inventario" ? "default" : "ghost"}
                className="w-full justify-start mb-2"
                onClick={() => handleSectionChange("inventario")}
              >
                <ShoppingBag className="mr-2 h-4 w-4" /> Inventario
              </Button>
            )}
            <Button
              variant={activeSection === "historial" ? "default" : "ghost"}
              className="w-full justify-start mb-2"
              onClick={() => handleSectionChange("historial")}
            >
              <Clock className="mr-2 h-4 w-4" /> Historial
            </Button>
            {user.role === 'admin' && (
              <Button
                variant={activeSection === "empleados" ? "default" : "ghost"}
                className="w-full justify-start mb-2"
                onClick={() => handleSectionChange("empleados")}
              >
                <Users className="mr-2 h-4 w-4" /> Empleados
              </Button>
            )}
            {(user.role === 'admin' || user.role === 'employee') && (
              <Button
                variant={activeSection === "notificaciones" ? "default" : "ghost"}
                className="w-full justify-start mb-2"
                onClick={() => handleSectionChange("notificaciones")}
              >
                <Bell className="mr-2 h-4 w-4" /> Notificaciones
                {notifications.filter(n => !n.read).length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {notifications.filter(n => !n.read).length}
                  </Badge>
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              className="w-full justify-start mt-4"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
            </Button>
          </nav>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-3xl font-bold mb-6">
          {activeSection === "pedidos" && "Dashboard de Pedidos"}
          {activeSection === "clientes" && "Gestión de Clientes"}
          {activeSection === "produccion" && "Control de Producción"}
          {activeSection === "inventario" && "Gestión de Inventario"}
          {activeSection === "historial" && "Historial de Pedidos"}
          {activeSection === "empleados" && "Gestión de Empleados"}
          {activeSection === "notificaciones" && "Notificaciones"}
        </h1>

        {activeSection === "pedidos" && (
          <>
            {/* Resumen de pedidos */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {user.role === 'client'
                      ? orders.filter(order => order.client === user.username).length
                      : orders.length
                    }
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">En Producción</CardTitle>
                  <Scissors className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {user.role === 'client'
                      ? orders.filter(order => order.client === user.username && order.status === "En producción").length
                      : orders.filter(order => order.status === "En producción").length
                    }
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completados</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {user.role === 'client'
                      ? orders.filter(order => order.client === user.username && order.status === "Completado").length
                      : orders.filter(order => order.status === "Completado").length
                    }
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Entregados</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {user.role === 'client'
                        // @ts-ignore
                      ? deliveredOrders.filter(order => order.client === user.username).length
                      : deliveredOrders.length
                    }
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabla de pedidos y detalles */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Lista de Pedidos</CardTitle>
                  <CardDescription>Haga clic en un pedido para ver más detalles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Search className="h-5 w-5 text-muted-foreground" />
                      <Input
                        placeholder="Buscar pedidos..."
                        className="flex-1"
                        value={searchTerm}
                        onChange={handleSearch}
                      />
                    </div>
                    <Tabs defaultValue="todos" onValueChange={handleFilter}>
                      <TabsList>
                        <TabsTrigger value="todos">Todos</TabsTrigger>
                        <TabsTrigger value="pendiente">Pendientes</TabsTrigger>
                        <TabsTrigger value="en producción">En Producción</TabsTrigger>
                        <TabsTrigger value="completado">Completados</TabsTrigger>
                      </TabsList>
                    </Tabs>
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="text-left p-2">ID</th>
                          <th className="text-left p-2">Cliente</th>
                          <th className="text-left p-2">Producto</th>
                          <th className="text-left p-2">Estado</th>
                          <th className="text-left p-2">Fecha de Entrega</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.filter(order => user.role === 'client' ? order.client === user.username : true).map((order) => (
                          <tr
                            key={order.id}
                            className="cursor-pointer hover:bg-gray-100"
                            // @ts-ignore
                            onClick={() => handleOrderSelect(order)}
                          >
                            <td className="p-2">{order.id}</td>
                            <td className="p-2">{order.client || "Sin asignar"}</td>
                            <td className="p-2">{order.product}</td>
                            <td className="p-2">
                              <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                            </td>
                            <td className="p-2">{formatDate(order.dueDate)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Detalles del pedido seleccionado */}
              <Card>
                <CardHeader>
                  <CardTitle>Detalles del Pedido</CardTitle>
                  <CardDescription>Información detallada del pedido seleccionado</CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedOrder ? (
                    <div className="space-y-4">
                      <div>
                        <Label>ID del Pedido</Label>
                        <div className="font-medium">{selectedOrder.id}</div>
                      </div>
                      <div>
                        <Label>Cliente</Label>
                        <div className="font-medium">{selectedOrder.client || "Sin asignar"}</div>
                      </div>
                      <div>
                        <Label>Producto</Label>
                        <div className="font-medium">{selectedOrder.product}</div>
                      </div>
                      <div>
                        <Label>Cantidad</Label>
                        <div className="font-medium">{selectedOrder.quantity}</div>
                      </div>
                      <div>
                        <Label>Estado</Label>
                        <Badge className={getStatusColor(selectedOrder.status)}>{selectedOrder.status}</Badge>
                      </div>
                      <div>
                        <Label>Fecha de Entrega</Label>
                        <div className="font-medium flex items-center">
                          <CalendarDays className="mr-2 h-4 w-4" />
                          {formatDate(selectedOrder.dueDate)}
                        </div>
                      </div>
                      <div>
                        <Label>Progreso del Pedido</Label>
                        <div className="space-y-2 mt-2">
                          {subtasks.map((subtask) => (
                            <div key={subtask} className="space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">{subtask}</span>
                                <span className="text-sm text-muted-foreground">
                                  {selectedOrder.progress[subtask].completed} / {selectedOrder.quantity}
                                </span>
                              </div>
                              <Progress
                                value={(selectedOrder.progress[subtask].completed / selectedOrder.quantity) * 100}
                                className="h-2"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      Seleccione un pedido para ver sus detalles
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {activeSection === "clientes" && (user.role === 'admin' || user.role === 'employee') && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Añadir Nuevo Cliente</CardTitle>
                <CardDescription>Cree un nuevo cliente</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); handleNewClientSubmit(); }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Nombre de Usuario</Label>
                      <Input
                        id="username"
                        name="username"
                        value={newClient.username}
                        onChange={handleNewClientChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={newClient.password}
                        onChange={handleNewClientChange}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit">Añadir Cliente</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lista de Clientes</CardTitle>
                <CardDescription>Gestione los clientes</CardDescription>
              </CardHeader>
              <CardContent>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-2">ID</th>
                      <th className="text-left p-2">Nombre de Usuario</th>
                      <th className="text-left p-2">Contraseña Actual</th>
                      <th className="text-left p-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(u => u.role === 'client').map((client) => (
                      <tr key={client.id}>
                        <td className="p-2">{client.id}</td>
                        <td className="p-2">{client.username}</td>
                        <td className="p-2">
                          <div className="flex items-center space-x-2">
                            <Input
                              type={showPasswords[client.id] ? "text" : "password"}
                              value={client.password}
                              readOnly
                              className="w-40"
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => togglePasswordVisibility(client.id)}
                            >
                              {showPasswords[client.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </td>
                        <td className="p-2">
                          <Button size="sm" onClick={() => {
                            const newPassword = Math.random().toString(36).slice(-8);
                            setUsers(users.map(u => u.id === client.id ? {...u, password: newPassword} : u));
                            toast.success("Contraseña actualizada")
                            toast.info(`Nueva contraseña para ${client.username}: ${newPassword}`);
                          }}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Nueva Contraseña
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" className="ml-2">
                                <Plus className="h-4 w-4 mr-2" />
                                Asignar Pedido
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Asignar Pedido a {client.username}</DialogTitle>
                                <DialogDescription>
                                  Seleccione un pedido para asignar a este cliente
                                </DialogDescription>
                              </DialogHeader>
                              <Select onValueChange={(value) => handleAssignOrder(client.id, parseInt(value))}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccione un pedido" />
                                </SelectTrigger>
                                <SelectContent>
                                  {orders.filter(order => !order.client).map((order) => (
                                    <SelectItem key={order.id} value={order.id.toString()}>
                                      Pedido #{order.id} - {order.product}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </DialogContent>
                          </Dialog>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === "produccion" && (user.role === 'admin' || user.role === 'employee') && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Crear Nuevo Pedido</CardTitle>
                <CardDescription>Añada un nuevo pedido al sistema de producción</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); handleNewOrderSubmit(); }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="product">Producto</Label>
                      <Input
                        id="product"
                        name="product"
                        value={newOrder.product}
                        onChange={handleNewOrderChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Cantidad</Label>
                      <Input
                        id="quantity"
                        name="quantity"
                        type="number"
                        value={newOrder.quantity}
                        onChange={handleNewOrderChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Fecha de Entrega</Label>
                    <Input
                      id="dueDate"
                      name="dueDate"
                      type="date"
                      value={newOrder.dueDate}
                      onChange={handleNewOrderChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtareas</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {subtasks.map((subtask) => (
                        <div key={subtask} className="flex items-center space-x-2">
                          <Checkbox
                            id={subtask}
                            // @ts-ignore
                            checked={newOrder.subtasks[subtask]}
                            onCheckedChange={() => handleSubtaskToggle(subtask)}
                          />
                          <label
                            htmlFor={subtask}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {subtask}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button type="submit">Crear Pedido</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pedidos en Producción</CardTitle>
                <CardDescription>Lista de pedidos actualmente en el sistema de producción</CardDescription>
              </CardHeader>
              <CardContent>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-2">ID</th>
                      <th className="text-left p-2">Cliente</th>
                      <th className="text-left p-2">Producto</th>
                      <th className="text-left p-2">Cantidad</th>
                      <th className="text-left p-2">Fecha de Entrega</th>
                      <th className="text-left p-2">Estado</th>
                      <th className="text-left p-2">Progreso</th>
                      <th className="text-left p-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-100">
                        <td className="p-2">{order.id}</td>
                        <td className="p-2">{order.client || "Sin asignar"}</td>
                        <td className="p-2">{order.product}</td>
                        <td className="p-2">{order.quantity}</td>
                        <td className="p-2">{formatDate(order.dueDate)}</td>
                        <td className="p-2">
                          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                        </td>
                        <td className="p-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">Actualizar Progreso</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Progreso del Pedido #{order.id}</DialogTitle>
                                <DialogDescription>
                                  Actualice el progreso de cada subtarea
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                {subtasks.map((subtask) => (
                                  <div key={subtask} className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor={`${order.id}-${subtask}`} className="text-right">
                                      {subtask}
                                    </Label>
                                    <Input
                                      id={`${order.id}-${subtask}`}
                                      type="number"
                                      className="col-span-3"
                                      // @ts-ignore
                                      value={order.progress[subtask].completed}
                                      onChange={(e) => handleSubtaskUpdate(order.id, subtask, e.target.value)}
                                      min={0}
                                      max={order.quantity}
                                    />
                                  </div>
                                ))}
                              </div>
                              <DialogFooter>
                                <Button type="submit">Guardar Cambios</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </td>
                        <td className="p-2">
                          <Select onValueChange={(value) => handleStatusUpdate(order.id, value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Cambiar estado" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pendiente">Pendiente</SelectItem>
                              <SelectItem value="En producción">En producción</SelectItem>
                              <SelectItem value="Completado">Completado</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === "inventario" && (user.role === 'admin' || user.role === 'employee') && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pedidos Completados</CardTitle>
                <CardDescription>Lista de pedidos listos para entrega</CardDescription>
              </CardHeader>
              <CardContent>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-2">ID</th>
                      <th className="text-left p-2">Cliente</th>
                      <th className="text-left p-2">Producto</th>
                      <th className="text-left p-2">Cantidad</th>
                      <th className="text-left p-2">Fecha de Entrega</th>
                      <th className="text-left p-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.filter(order => order.status === "Completado").map((order) => (
                      <tr key={order.id} className="hover:bg-gray-100">
                        <td className="p-2">{order.id}</td>
                        <td className="p-2">{order.client || "Sin asignar"}</td>
                        <td className="p-2">{order.product}</td>
                        <td className="p-2">{order.quantity}</td>
                        <td className="p-2">{formatDate(order.dueDate)}</td>
                        <td className="p-2">
                          <Button
                            size="sm"
                            onClick={() => handleMarkAsDelivered(order.id)}
                          >
                            Marcar como Entregado
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === "historial" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Pedidos Entregados</CardTitle>
                <CardDescription>Lista de pedidos que han sido entregados</CardDescription>
              </CardHeader>
              <CardContent>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-2">ID</th>
                      <th className="text-left p-2">Cliente</th>
                      <th className="text-left p-2">Producto</th>
                      <th className="text-left p-2">Cantidad</th>
                      <th className="text-left p-2">Fecha de Entrega</th>
                      <th className="text-left p-2">Fecha de Entrega Real</th>
                    </tr>
                  </thead>
                  <tbody>

                    {deliveredOrders.filter((order: Order) => user.role === 'client' ? order.client === user.username : true).map((order) => (
                      <tr key={order.id} className="hover:bg-gray-100">
                        <td className="p-2">{order.id}</td>
                        <td className="p-2">{order.client || "Sin asignar"}</td>
                        <td className="p-2">{order.product}</td>
                        <td className="p-2">{order.quantity}</td>
                        <td className="p-2">{formatDate(order.dueDate)}</td>
                        <td className="p-2">{formatDate(order.deliveredDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === "empleados" && user.role === 'admin' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Añadir Nuevo Empleado</CardTitle>
                <CardDescription>Cree un nuevo empleado</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); handleNewEmployeeSubmit(); }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Nombre de Usuario</Label>
                      <Input
                        id="username"
                        name="username"
                        value={newEmployee.username}
                        onChange={handleNewEmployeeChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={newEmployee.password}
                        onChange={handleNewEmployeeChange}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit">Añadir Empleado</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lista de Empleados</CardTitle>
                <CardDescription>Gestione los empleados y sus credenciales de acceso</CardDescription>
              </CardHeader>
              <CardContent>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-2">ID</th>
                      <th className="text-left p-2">Nombre de Usuario</th>
                      <th className="text-left p-2">Contraseña Actual</th>
                      <th className="text-left p-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(u => u.role === 'employee').map((employee) => (
                      <tr key={employee.id}>
                        <td className="p-2">{employee.id}</td>
                        <td className="p-2">{employee.username}</td>
                        <td className="p-2">
                          <div className="flex items-center space-x-2">
                            <Input
                              type={showPasswords[employee.id] ? "text" : "password"}
                              value={employee.password}
                              readOnly
                              className="w-40"
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => togglePasswordVisibility(employee.id)}
                            >
                              {showPasswords[employee.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </td>
                        <td className="p-2">
                          <Button size="sm" onClick={() => {
                            const newPassword = Math.random().toString(36).slice(-8);
                            setUsers(users.map(u => u.id === employee.id ? {...u, password: newPassword} : u));
                            toast.success("Contraseña actualizada")
                            toast.info(`Nueva contraseña para ${employee.username}: ${newPassword}`);
                          }}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Nueva Contraseña
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleEmployeeDelete(employee.id)} className="ml-2">
                            <X className="h-4 w-4 mr-2" />
                            Eliminar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === "notificaciones" && (user.role === 'admin' || user.role === 'employee') && (
          <Notifications notifications={notifications} onMarkAsRead={handleMarkNotificationAsRead} />
        )}
      </div>
    </div>
  )
}