import { FaHtml5, FaCss3Alt } from "react-icons/fa"
import { IoLogoJavascript } from "react-icons/io"
import { SiTailwindcss, SiVite, SiReact } from "react-icons/si"
import { VscJson } from "react-icons/vsc"
import { AiFillFile } from "react-icons/ai"

export function getFileIcon(file:any) {
  if (file.endsWith(".html")) return <FaHtml5 color="#e34c26" />
  if (file.endsWith(".css")) return <FaCss3Alt color="#264de4" />
  if (file.endsWith(".js")) return <IoLogoJavascript color="#f7df1e" />
  if (file.endsWith(".jsx")) return <SiReact color="#61dafb" />
  if (file.endsWith(".json")) return <VscJson />
  if (file.includes("tailwind")) return <SiTailwindcss color="#38bdf8" />
  if (file.includes("vite")) return <SiVite color="#a855f7" />

  return <AiFillFile />
}