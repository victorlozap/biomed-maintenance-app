# 📚 Conceptos de Ingeniería: Seguridad y Autenticación (Auth)

**Fecha de registro:** 15 de Mayo de 2026
**Contexto:** Protección de datos sensibles e infraestructura Cloud.

## ¿Qué es la Autenticación y Autorización?
En el desarrollo de software hospitalario, la seguridad no es opcional, es una obligación legal. No podemos permitir que cualquier persona con el link de la aplicación web acceda a los historiales de mantenimiento de equipos médicos que sustentan vidas humanas.

Para resolver esto, implementamos un sistema de **Autenticación (AuthContext)** utilizando el SDK de Supabase. Esto nos permite manejar sesiones cifradas y tokens de acceso (JWT). Además, implementamos protección de rutas en React, lo que significa que la aplicación bloquea físicamente la visualización de las pantallas si no detecta una credencial válida.

### Diferencia clave:
*   **Autenticación:** Verificar *quién* sos (Ej: "Soy Víctor, el ingeniero biomédico, acá está mi contraseña").
*   **Autorización:** Verificar *qué* podés hacer (Ej: "Víctor está autorizado para editar el inventario, pero el usuario 'Mantenimiento General' solo tiene permiso para lectura").

---

## 🏥 Analogía Hospitalaria

Imaginate la seguridad física dentro del propio hospital San Jorge.

**La Autenticación** es el guardia de seguridad en la puerta principal. Vos llegás, le mostrás tu cédula y tu carnet de empleado. El guardia verifica que sos vos y te deja entrar al edificio. Si no tenés carnet, te quedás en la calle (Pantalla de Login).

**La Autorización** son las tarjetas de acceso magnéticas con colores. Ya estás adentro del hospital (estás autenticado), pero tu tarjeta de biomédico te permite abrir la puerta del quirófano y del cuarto de equipos de soporte vital. Si un empleado de cafetería intenta pasar su tarjeta por la puerta del quirófano, la puerta no se abre, porque aunque trabaja en el hospital, no está **autorizado** para esa zona (Row Level Security en Bases de Datos).

---

## 🛠 Justificación Técnica de la Decisión

1. **Tokens Cifrados (JWT):** Usar la autenticación de Supabase nos permite delegar el manejo de contraseñas a algoritmos de encriptación de grado militar (Bcrypt/Argon2). Nosotros no guardamos contraseñas en texto plano, evadiendo responsabilidades civiles en caso de un ataque cibernético.
2. **Contexto Global (React Context API):** Creamos un `AuthContext` que envuelve toda la aplicación. Esto asegura que si la sesión de un usuario expira (timeout) mientras está trabajando, la aplicación entera lo detecta instantáneamente y lo expulsa a la pantalla de Login para proteger la máquina desatendida.
3. **Firmas Dinámicas Acopladas:** Al tener control de la sesión, los reportes PDF generados inyectan automáticamente el nombre y la firma del usuario logueado, erradicando la posibilidad de falsificación de documentos y garantizando el principio de No Repudio.

> **Nota Académica para Proyecto de Grado:**
> La arquitectura implementa el principio de **Zero Trust (Confianza Cero)** en su capa de presentación mediante Componentes de Orden Superior (HOCs) para la protección de rutas (`ProtectedRoute`). Adicionalmente, el manejo de sesión se delega al proveedor de Identidad (Supabase Auth) mediante tokens JWT, asegurando la trazabilidad de operaciones (Audit Trail) y el cumplimiento de las normativas de privacidad de datos clínicos.
