import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"

export default async function DashboardIndex() {
  // 1. Get the Session
  const session = await getServerSession(authOptions)
  
  // 2. If no session, kick to login (Safety Net)
  if (!session) redirect("/login")

  const role = session.user.role

  // 3. The "Traffic Control" Switch
  // This automatically sends them to their correct home base
  switch (role) {
    case 'TRIAGE_NURSE':
      redirect('/triage')
      break
    case 'DOCTOR':
      redirect('/ward')
      break
    case 'CLEANER':
      redirect('/cleaning')
      break
    case 'SITE_MANAGER':
      redirect('/ops')
      break
    case 'WARD_NURSE':
      redirect('/ward') 
      break
    default:
      return (
         <div className="p-10">
           <h1 className="text-2xl">Role Not Recognized</h1>
           <p>Please contact IT. Your role is: {role}</p>
         </div>
      )
  }
}