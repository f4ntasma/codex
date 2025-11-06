/**
 * Script para crear usuarios de prueba
 * 
 * Uso:
 *   node scripts/create-test-users.js
 * 
 * O con variables de entorno:
 *   NEXT_PUBLIC_SUPABASE_URL=tu_url SUPABASE_SERVICE_ROLE_KEY=tu_key node scripts/create-test-users.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Intentar cargar variables de entorno desde .env.local
try {
  const envPath = path.join(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/)
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].trim().replace(/^["']|["']$/g, '')
      }
    })
  }
} catch (error) {
  // Ignorar errores al cargar .env.local
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Error: Faltan variables de entorno')
  console.error('   NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridas')
  console.error('\n   Asegúrate de tener un archivo .env.local con estas variables')
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Usuarios de prueba
const testUsers = [
  {
    email: 'student@test.edu',
    password: 'Test123456',
    name: 'Estudiante Test',
    role: 'student',
    expectedRole: 'student'
  },
  {
    email: 'corporate@intercorp.com',
    password: 'Test123456',
    name: 'Corporativo Test',
    role: 'corporate',
    expectedRole: 'corporate'
  },
  {
    email: 'admin@test.edu',
    password: 'Test123456',
    name: 'Admin Test',
    role: 'admin',
    expectedRole: 'student' // Se crea como student, luego se actualiza a admin
  }
]

async function createUser(userData) {
  try {
    console.log(`\n📝 Creando usuario: ${userData.email}...`)
    
    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true, // Confirmar email automáticamente
      user_metadata: {
        name: userData.name
      }
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log(`   ⚠️  Usuario ${userData.email} ya existe, actualizando...`)
        
        // Obtener el usuario existente
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
        const existingUser = existingUsers.users.find(u => u.email === userData.email)
        
        if (!existingUser) {
          throw new Error('Usuario existe pero no se pudo encontrar')
        }

        // Actualizar contraseña
        await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
          password: userData.password
        })

        // Verificar/crear perfil
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', existingUser.id)
          .single()

        if (!profile) {
          // Crear perfil si no existe
          await supabaseAdmin
            .from('profiles')
            .insert({
              id: existingUser.id,
              email: userData.email,
              name: userData.name,
              role: userData.expectedRole
            })
        } else {
          // Actualizar rol si es necesario
          if (profile.role !== userData.role) {
            await supabaseAdmin
              .from('profiles')
              .update({ role: userData.role })
              .eq('id', existingUser.id)
          }
        }

        console.log(`   ✅ Usuario ${userData.email} actualizado`)
        return { email: userData.email, password: userData.password, role: userData.role }
      }
      throw authError
    }

    if (!authData.user) {
      throw new Error('No se creó el usuario')
    }

    // Esperar un momento para que el trigger se ejecute
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Verificar que el perfil se creó
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (!profile) {
      console.log(`   ⚠️  Perfil no se creó automáticamente, creando manualmente...`)
      await supabaseAdmin
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: userData.email,
          name: userData.name,
          role: userData.expectedRole
        })
    }

    // Si es admin, actualizar el rol
    if (userData.role === 'admin') {
      await supabaseAdmin
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', authData.user.id)
      console.log(`   ✅ Rol actualizado a 'admin'`)
    }

    console.log(`   ✅ Usuario ${userData.email} creado exitosamente`)
    return { email: userData.email, password: userData.password, role: userData.role }

  } catch (error) {
    console.error(`   ❌ Error creando usuario ${userData.email}:`, error.message)
    return null
  }
}

async function main() {
  console.log('🚀 Creando usuarios de prueba...\n')
  console.log('=' .repeat(60))

  const results = []

  for (const user of testUsers) {
    const result = await createUser(user)
    if (result) {
      results.push(result)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('\n📋 RESUMEN DE USUARIOS CREADOS:\n')

  if (results.length === 0) {
    console.log('❌ No se crearon usuarios')
    return
  }

  results.forEach((user, index) => {
    console.log(`${index + 1}. ${user.role.toUpperCase()}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Password: ${user.password}`)
    console.log(`   Rol: ${user.role}\n`)
  })

  console.log('✅ Usuarios listos para usar!\n')
  console.log('💡 Puedes iniciar sesión con cualquiera de estos usuarios en /login')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })

