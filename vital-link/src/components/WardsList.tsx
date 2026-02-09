'use client'

import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card"

type Ward = {
  id: string
  name: string
  type: string
  _count?: {
    beds: number
  }
}

export default function WardsList({ wards }: { wards: Ward[] }) {
  const router = useRouter()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {wards.map((ward) => (
        <Card key={ward.id} onClick={() => router.push(`/ward/${ward.id}`)} className="group cursor-pointer transition-all hover:scale-[1.02]">
          <CardHeader>
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                ward.type === 'Emergency' ? 'bg-red-100 text-red-600' :
                ward.type === 'Paediatrics' ? 'bg-purple-100 text-purple-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                <span className="font-bold text-xl">{ward.name[0]}</span>
              </div>
              <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">
                ID: {ward.id.slice(0,4)}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600">
              {ward.name}
            </CardTitle>
            <p className="text-sm text-gray-500 mb-4">{ward.type} Ward</p>
            <div className="flex items-center text-xs text-gray-400 border-t pt-4">
              <span>{ward._count?.beds || 0} Beds Available</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}