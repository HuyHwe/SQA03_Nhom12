// src/pages/shared/Discover/Components/TopicIcon.jsx
import { Code2, Layers, Cpu, Database, Cloud } from "lucide-react";

export default function TopicIcon({ topic, className = "w-4 h-4" }) {
    const map = {
        web: <Code2 className={className} />,
        backend: <Layers className={className} />,
        cs: <Cpu className={className} />,
        db: <Database className={className} />,
        devops: <Cloud className={className} />,
    };
    return map[topic] || <Code2 className={className} />;
}
