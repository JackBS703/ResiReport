# ResiReport 🏢

Sistema web de gestión de denuncias para conjuntos residenciales.
Permite a residentes radicar denuncias y a administradores/porteros gestionarlas con seguimiento de estados.

**Institución:** Politécnico Jaime Isaza Cadavid  
**Materia:** Pruebas y gestión de Software  
**Fecha:** Marzo 2026

## Tecnologías

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT (jsonwebtoken) + bcryptjs
- dotenv, cors, nodemon

### Frontend
- React 18 + Vite
- React Router DOM v7
- Axios
- Tailwind CSS v4 + shadcn/ui (Radix)

---

## 📁 Estructura del proyecto

```
ResiReport/
├── frontend/                        # React + Vite + Tailwind v4
│   └── src/
│       ├── api/
│       │   ├── axiosInstance.js     # Instancia base Axios con interceptores JWT
│       │   ├── authApi.js
│       │   ├── complaintsApi.js
│       │   ├── catalogApi.js
│       │   ├── residentsApi.js
│       │   └── adminsApi.js
│       ├── assets/
│       ├── components/
│       │   ├── shared/              # Navbar, ConfirmDialog, Badges, SearchInput
│       │   └── ui/                  # Componentes shadcn/ui
│       ├── context/                 # AuthContext (JWT + rol)
│       ├── hooks/                   # useAuth, useDebounce
│       ├── lib/
│       ├── pages/
│       │   ├── auth/                # LoginPage
│       │   ├── resident/            # MyComplaintsPage, CreateComplaintPage,
│       │   │                        #   ComplaintDetailPage
│       │   └── admin/               # AllComplaintsPage, ComplaintDetailAdminPage,
│       │                            #   ResidentsPage, AdminsPage,
│       │                            #   ComplaintTypesPage, ComplaintStatusesPage
│       ├── routes/                  # PrivateRoute, RoleRoute
│       ├── utils/                   # constants.js, formatDate.js
│       ├── App.jsx
│       └── main.jsx
│
├── backend/                         # Node.js + Express + Mongoose
│   ├── server.js
│   └── src/
│       ├── app.js
│       ├── config/                  # db.js, env.js
│       ├── controllers/             # authController, complaintController,
│       │                            #   residentController, adminController,
│       │                            #   catalogController
│       ├── middlewares/             # verifyToken, verifyRole, errorHandler
│       ├── models/                  # User, Complaint, ComplaintType, ComplaintStatus
│       ├── routes/                  # authRoutes, complaintRoutes, residentRoutes,
│       │                            #   adminRoutes, catalogRoutes
│       └── seeders/                 # seed.js (Super Admin + datos iniciales)
│
├── docs/
│   └── DESIGN.md                    # Arquitectura, modelos, API y decisiones técnicas
├── package.json                     # Scripts raíz (concurrently)
└── README.md
```


---

## ⚙️ Setup local

### Prerequisitos
- Node.js v18+
- Git
- Cuenta en MongoDB Atlas (free tier)

### 1. Clonar el repositorio
```bash
git clone https://github.com/jackbs703/resireport.git
cd resireport
git checkout dev
```
### 2. Variables de entorno
```bash
cp backend/.env.example backend/.env
```
Variables requeridas:
```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/resireport
JWT_SECRET=un_secreto_largo_y_seguro
PORT=5000
```

Edita backend/.env con tus credenciales reales de MongoDB Atlas y un JWT_SECRET seguro.
### 3. Instalar dependencias
```bash
# Raíz (concurrently)
npm install

# Frontend
cd frontend && npm install

# Backend
cd ../backend && npm install
```
### 4. Ejecutar en desarrollo
```bash
# Desde la raíz — levanta frontend y backend simultáneamente
npm run dev
```

| Servicio     | URL                              |
|--------------|----------------------------------|
| Frontend     | http://localhost:5173            |
| Backend      | http://localhost:5000            |
| Health check | http://localhost:5000/api/health |

### 5. Seed — Crear Super Admin inicial
```bash
npm run seed
```
| Rol        | Email                | Contraseña |
|------------|----------------------|------------|
| Superadmin | admin@resireport.com | Admin1234  |

> ⚠️ Cambiar la contraseña después del primer login en producción.

### Agregar componentes shadcn/ui
```bash
cd frontend
npx shadcn@latest add [nombre-componente]
# Ejemplo: npx shadcn@latest add dialog
```
---

## 🌿 Flujo de ramas

| Rama | Propósito |
| :-- | :-- |
| `main` | Producción — solo recibe merges desde `dev` |
| `dev` | Integración continua del equipo |
| `feat/*` | Desarrollo de funcionalidades individuales |


---

## 👥 Equipo

| Persona         | Módulos                                                          |
|-----------------|------------------------------------------------------------------|
| Mateo Berrío Cardona    | Auth  · Infraestructura compartida |
| Mariana Montoya Sepúlveda | Gestión de usuarios                                 |
| Esteban Cano Ramírez    | Catálogos (tipos y estados de denuncia)                          |
| Yeimy Herrera Bedoya  | Gestión de Denuncias                                          |

