import NewPatientForm from "@/src/components/NewPatientFrom";
export default function Triage() {
    return (
        <div className="max-w-4xl mx-auto p-6">
          <h1 className="text-2xl font-bold mb-6">Triage Admission</h1>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <NewPatientForm />
          </div>
        </div>
      );
}
