export default function formatRole(role:string) {
    let split = role.split("_")
    let formatted = ""
    for (let i = 0; i < split.length; i++){
        formatted += split[i].charAt(0).toUpperCase() + split[i].slice(1).toLowerCase() + " "
    }
    return formatted
}