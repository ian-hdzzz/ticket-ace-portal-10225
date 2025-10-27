import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Bot,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Phone,
  MessageSquare,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Agent {
  id: string;
  name: string;
  type: "voice" | "chat";
  status: "active" | "inactive";
  model: string;
  voice?: string;
  systemPrompt: string;
  assignmentRules: string;
  lastUpdated: string;
}

const defaultAgents: Agent[] = [
  {
    id: "agent-1",
    name: "Asistente de Atención al Cliente",
    type: "chat",
    status: "active",
    model: "google/gemini-2.5-flash",
    systemPrompt: "Eres un asistente virtual de CEA Querétaro. Tu objetivo es ayudar a los ciudadanos con sus consultas sobre servicios de agua, reportar problemas y proporcionar información sobre facturación.",
    assignmentRules: "Tickets generales de consulta",
    lastUpdated: "Hace 2 días",
  },
  {
    id: "agent-2",
    name: "Agente de Emergencias",
    type: "voice",
    status: "active",
    model: "google/gemini-2.5-pro",
    voice: "alloy",
    systemPrompt: "Eres un agente especializado en emergencias de agua. Debes recopilar información crítica sobre fugas, inundaciones o problemas urgentes de manera rápida y eficiente.",
    assignmentRules: "Tickets urgentes y emergencias",
    lastUpdated: "Hace 1 semana",
  },
];

export default function Agents() {
  const [agents, setAgents] = useState<Agent[]>(defaultAgents);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSaveAgent = () => {
    if (!editingAgent) return;

    if (editingAgent.id.startsWith("new-")) {
      // New agent
      setAgents([...agents, { ...editingAgent, id: `agent-${Date.now()}`, lastUpdated: "Justo ahora" }]);
    } else {
      // Update existing
      setAgents(agents.map(a => a.id === editingAgent.id ? { ...editingAgent, lastUpdated: "Justo ahora" } : a));
    }
    
    setIsDialogOpen(false);
    setEditingAgent(null);
  };

  const handleDeleteAgent = (id: string) => {
    setAgents(agents.filter(a => a.id !== id));
  };

  const handleCreateNew = () => {
    setEditingAgent({
      id: `new-${Date.now()}`,
      name: "",
      type: "chat",
      status: "inactive",
      model: "google/gemini-2.5-flash",
      systemPrompt: "",
      assignmentRules: "",
      lastUpdated: "",
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agentes IA</h1>
          <p className="text-muted-foreground">
            Configura y administra los agentes de IA que atienden a los usuarios
          </p>
        </div>
        <Button onClick={handleCreateNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Agente
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {agents.map((agent) => (
          <Card key={agent.id} className="transition-all hover:shadow-medium">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-card">
                    {agent.type === "voice" ? (
                      <Phone className="h-6 w-6 text-primary" />
                    ) : (
                      <MessageSquare className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {agent.type === "voice" ? "Agente de Voz" : "Agente de Chat"}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={agent.status === "active" ? "success" : "secondary"}>
                  {agent.status === "active" ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Modelo:</span>
                  <span className="font-medium">{agent.model}</span>
                </div>
                {agent.voice && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Voz:</span>
                    <span className="font-medium capitalize">{agent.voice}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Última actualización:</span>
                  <span className="font-medium">{agent.lastUpdated}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Reglas de asignación:</p>
                <p className="text-sm font-medium">{agent.assignmentRules}</p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setEditingAgent(agent);
                    setIsDialogOpen(true);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => handleDeleteAgent(agent.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              {editingAgent?.id.startsWith("new-") ? "Crear Nuevo Agente" : "Editar Agente"}
            </DialogTitle>
            <DialogDescription>
              Configura los parámetros del agente de IA para optimizar sus respuestas
            </DialogDescription>
          </DialogHeader>

          {editingAgent && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Agente</Label>
                  <Input
                    id="name"
                    value={editingAgent.name}
                    onChange={(e) => setEditingAgent({ ...editingAgent, name: e.target.value })}
                    placeholder="Ej: Asistente de Atención al Cliente"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de Agente</Label>
                    <Select
                      value={editingAgent.type}
                      onValueChange={(value: "voice" | "chat") =>
                        setEditingAgent({ ...editingAgent, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="chat">Chat (Texto)</SelectItem>
                        <SelectItem value="voice">Voz (Telefónico)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model">Modelo de IA</Label>
                    <Select
                      value={editingAgent.model}
                      onValueChange={(value) =>
                        setEditingAgent({ ...editingAgent, model: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="google/gemini-2.5-flash">Gemini 2.5 Flash (Recomendado)</SelectItem>
                        <SelectItem value="google/gemini-2.5-pro">Gemini 2.5 Pro (Avanzado)</SelectItem>
                        <SelectItem value="google/gemini-2.5-flash-lite">Gemini 2.5 Flash Lite (Rápido)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {editingAgent.type === "voice" && (
                  <div className="space-y-2">
                    <Label htmlFor="voice">Voz</Label>
                    <Select
                      value={editingAgent.voice || "alloy"}
                      onValueChange={(value) =>
                        setEditingAgent({ ...editingAgent, voice: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alloy">Alloy</SelectItem>
                        <SelectItem value="echo">Echo</SelectItem>
                        <SelectItem value="shimmer">Shimmer</SelectItem>
                        <SelectItem value="nova">Nova</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label>Estado del Agente</Label>
                    <p className="text-sm text-muted-foreground">
                      {editingAgent.status === "active" ? "El agente está activo y respondiendo" : "El agente está desactivado"}
                    </p>
                  </div>
                  <Switch
                    checked={editingAgent.status === "active"}
                    onCheckedChange={(checked) =>
                      setEditingAgent({ ...editingAgent, status: checked ? "active" : "inactive" })
                    }
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="systemPrompt">Instrucciones del Sistema</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Define cómo debe comportarse el agente y qué información debe proporcionar
                  </p>
                  <Textarea
                    id="systemPrompt"
                    value={editingAgent.systemPrompt}
                    onChange={(e) =>
                      setEditingAgent({ ...editingAgent, systemPrompt: e.target.value })
                    }
                    placeholder="Eres un asistente virtual de CEA Querétaro..."
                    className="min-h-[120px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assignmentRules">Reglas de Asignación</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Define qué tipos de tickets debe manejar este agente
                  </p>
                  <Input
                    id="assignmentRules"
                    value={editingAgent.assignmentRules}
                    onChange={(e) =>
                      setEditingAgent({ ...editingAgent, assignmentRules: e.target.value })
                    }
                    placeholder="Ej: Tickets urgentes y emergencias"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingAgent(null);
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button onClick={handleSaveAgent}>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Agente
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
