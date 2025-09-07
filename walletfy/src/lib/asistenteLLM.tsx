import { useEffect, useState } from 'react'
import * as webllm from '@mlc-ai/web-llm'
import type { EventType } from '@/types/event'
import DataRepo from '@/api/datasource'

interface ChatMessage {
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp?: number
}

// Modelo único seleccionado - el más balanceado
const SELECTED_MODEL = 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC'

// ───────────────────────────────────────────────────────────────────────────────
// Utils
// ───────────────────────────────────────────────────────────────────────────────
function monthKey(d: Date) {
    const y = d.getFullYear()
    const m = `${d.getMonth() + 1}`.padStart(2, '0')
    return `${y}-${m}`
}

function round2(n: number) {
    return Math.round((n + Number.EPSILON) * 100) / 100
}

function getRecentConversation(chat: ChatMessage[], maxTurns: number) {
    const msgs = chat.filter(m => m.role !== 'system')
    const trimmed = msgs.slice(Math.max(0, msgs.length - maxTurns * 2))
    return trimmed
}

type ContextStats = {
    monthsIncluded: number
    totalEvents: number
    approxTokens: number
    mode: 'compact' | 'extended' | 'auto-shrunk'
    monthsRange: string
}

// ───────────────────────────────────────────────────────────────────────────────
// Context builder optimizado - INCLUYE TODOS LOS EVENTOS por defecto
// ───────────────────────────────────────────────────────────────────────────────
function buildFinancialContext(eventos: EventType[], targetTokenBudget = 3400) {
    const ordered = (eventos || [])
        .filter(e => !Number.isNaN(new Date(e.fecha).getTime()))
        .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())

    // Agregación por mes
    const perMes: Record<string, {
        ingresos: number
        egresos: number
        balance: number
        montoGlobal: number
        count: number
    }> = {}

    let totalIngresos = 0
    let totalEgresos = 0

    // Lista de TODOS los eventos individuales (por defecto incluida)
    const allEventsFlat: Array<{ mes: string; nombre: string; cantidad: number; tipo: 'ingreso' | 'egreso'; fecha: string; descripcion?: string }> = []

    for (const ev of ordered) {
        const mk = monthKey(new Date(ev.fecha))
        if (!perMes[mk]) perMes[mk] = { ingresos: 0, egresos: 0, balance: 0, montoGlobal: 0, count: 0 }
        if (ev.tipo === 'ingreso') {
            perMes[mk].ingresos += ev.cantidad
            totalIngresos += ev.cantidad
        } else {
            perMes[mk].egresos += ev.cantidad
            totalEgresos += ev.cantidad
        }
        perMes[mk].count += 1

        // Añadir evento individual (SIN descripción para ahorrar tokens)
        allEventsFlat.push({
            mes: mk,
            nombre: ev.nombre,
            cantidad: ev.cantidad,
            tipo: ev.tipo,
            fecha: ev.fecha
        })
    }

    const monthKeys = Object.keys(perMes).sort()
    let acumulado = 0
    for (const mk of monthKeys) {
        const m = perMes[mk]
        m.balance = round2(m.ingresos - m.egresos)
        acumulado += m.balance
        m.montoGlobal = round2(acumulado)
        m.ingresos = round2(m.ingresos)
        m.egresos = round2(m.egresos)
    }

    // Resúmenes por mes
    let maxEgresosMes: string | null = null, maxEgresos = -Infinity
    let maxIngresosMes: string | null = null, maxIngresos = -Infinity
    let maxBalanceMes: string | null = null, maxBalance = -Infinity
    let minBalanceMes: string | null = null, minBalance = Infinity
    for (const mk of monthKeys) {
        const m = perMes[mk]
        if (m.egresos > maxEgresos) { maxEgresos = m.egresos; maxEgresosMes = mk }
        if (m.ingresos > maxIngresos) { maxIngresos = m.ingresos; maxIngresosMes = mk }
        if (m.balance > maxBalance) { maxBalance = m.balance; maxBalanceMes = mk }
        if (m.balance < minBalance) { minBalance = m.balance; minBalanceMes = mk }
    }

    // Top eventos
    const topEgresosEventos = [...ordered]
        .filter(e => e.tipo === 'egreso')
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 10)
        .map(e => ({ mes: monthKey(new Date(e.fecha)), nombre: e.nombre, cantidad: round2(e.cantidad) }))

    const topIngresosEventos = [...ordered]
        .filter(e => e.tipo === 'ingreso')
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 10)
        .map(e => ({ mes: monthKey(new Date(e.fecha)), nombre: e.nombre, cantidad: round2(e.cantidad) }))

    const evMaxEgreso = ordered
        .filter(e => e.tipo === 'egreso')
        .reduce<EventType | null>((acc, e) => (acc === null || e.cantidad > acc.cantidad ? e : acc), null)

    const evMaxIngreso = ordered
        .filter(e => e.tipo === 'ingreso')
        .reduce<EventType | null>((acc, e) => (acc === null || e.cantidad > acc.cantidad ? e : acc), null)

    const eventoMaxEgreso = evMaxEgreso ? {
        mes: monthKey(new Date(evMaxEgreso.fecha)),
        nombre: evMaxEgreso.nombre,
        cantidad: round2(evMaxEgreso.cantidad)
    } : null

    const eventoMaxIngreso = evMaxIngreso ? {
        mes: monthKey(new Date(evMaxIngreso?.fecha!)),
        nombre: evMaxIngreso!.nombre,
        cantidad: round2(evMaxIngreso!.cantidad)
    } : null

    const payload: any = {
        definiciones: {
            indiceMes: 'YYYY-MM',
            ingresos: 'suma de montos con tipo = "ingreso" en ese mes',
            egresos: 'suma de montos con tipo = "egreso" en ese mes',
            balance: 'ingresos - egresos del mes',
            montoGlobal: 'balance del mes + suma de balances de meses anteriores (acumulado)'
        },
        totales: {
            ingresos: round2(totalIngresos),
            egresos: round2(totalEgresos),
            balance: round2(totalIngresos - totalEgresos),
            mesesConDatos: monthKeys.length
        },
        meses: Object.fromEntries(monthKeys.map(mk => [mk, perMes[mk]])),
        resumen: {
            maxEgresosMes, maxEgresos: round2(maxEgresos === -Infinity ? 0 : maxEgresos),
            maxIngresosMes, maxIngresos: round2(maxIngresos === -Infinity ? 0 : maxIngresos),
            maxBalanceMes, maxBalance: round2(maxBalance === -Infinity ? 0 : maxBalance),
            minBalanceMes, minBalance: round2(minBalance === Infinity ? 0 : minBalance),
            eventoMaxEgreso,
            eventoMaxIngreso
        },
        topEventos: { egresos: topEgresosEventos, ingresos: topIngresosEventos },
        // INCLUIR TODOS LOS EVENTOS por defecto
        todos_los_eventos: allEventsFlat.map(e => ({
            mes: e.mes, nombre: e.nombre, cantidad: round2(e.cantidad), tipo: e.tipo, fecha: e.fecha
        }))
    }

    let finalJSON = JSON.stringify(payload)
    let finalTokens = Math.ceil(finalJSON.length / 4)
    let mode: ContextStats['mode'] = 'extended'

    // Auto-shrink si excede el budget
    if (finalTokens > targetTokenBudget) {
        mode = 'auto-shrunk'

        // Primero eliminar todos los eventos individuales
        delete payload.todos_los_eventos

        // Reducir top eventos
        payload.topEventos.egresos = payload.topEventos.egresos.slice(0, 5)
        payload.topEventos.ingresos = payload.topEventos.ingresos.slice(0, 5)

        finalJSON = JSON.stringify(payload)
        finalTokens = Math.ceil(finalJSON.length / 4)

        // Si aún excede, reducir a últimos 12 meses
        if (finalTokens > targetTokenBudget) {
            const last12 = monthKeys.slice(Math.max(0, monthKeys.length - 12))
            payload.meses = Object.fromEntries(last12.map(mk => [mk, perMes[mk]]))
            finalJSON = JSON.stringify(payload)
            finalTokens = Math.ceil(finalJSON.length / 4)
        }
    }

    const stats: ContextStats = {
        monthsIncluded: Object.keys(payload.meses).length,
        totalEvents: ordered.length,
        approxTokens: finalTokens,
        mode,
        monthsRange: (() => {
            const ks = Object.keys(payload.meses).sort()
            if (ks.length === 0) return '—'
            return `${ks[0]} → ${ks[ks.length - 1]}`
        })()
    }

    return { json: finalJSON, stats }
}

// ───────────────────────────────────────────────────────────────────────────────
// Prompt del sistema
// ───────────────────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Eres Walletfy AI, un asistente experto en finanzas personales.
Responde SIEMPRE en español, con precisión, y basándote ÚNICAMENTE en el JSON de contexto (no inventes datos).

DEFINICIONES:
- "ingresos": suma de montos con tipo = "ingreso" en un mes.
- "egresos": suma de montos con tipo = "egreso" en un mes.
- "balance": ingresos - egresos del mes.
- "montoGlobal": balance del mes + la suma de balances de todos los meses anteriores (acumulado).
- El índice del mes es "YYYY-MM".

REGLAS:
1) "mayores gastos" = el mes con mayor "egresos" (NO el de peor balance).
2) "mejor mes" = mes con mayor "balance"; "peor mes" = mes con menor "balance".
3) Usa "montoGlobal" cuando pregunten por acumulado.
4) Si piden "evento con mayor gasto/ingreso", usa el mayor por "cantidad".
5) Menciona siempre el mes (YYYY-MM) y cifra exacta.
6) Si el dato no existe, dilo sin inventar.

FORMATO:
- Consultas simples: viñetas breves con cifras.
- Comparativas: nombra meses y cierra con una recomendación.`

// ───────────────────────────────────────────────────────────────────────────────
// Componente principal
// ───────────────────────────────────────────────────────────────────────────────
export default function AsistenteLLM() {
    const [engine, setEngine] = useState<webllm.MLCEngineInterface | null>(null)
    const [loading, setLoading] = useState(true)
    const [loadingProgress, setLoadingProgress] = useState('')
    const [input, setInput] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [chat, setChat] = useState<ChatMessage[]>(() => {
        if (typeof localStorage !== 'undefined') {
            const saved = localStorage.getItem('walletfy_chat_history')
            if (saved) { try { return JSON.parse(saved) as ChatMessage[] } catch { return [] } }
        }
        return []
    })

    // Parámetros configurables del modelo
    const [temperature, setTemperature] = useState(0.3)
    const [topP, setTopP] = useState(0.85)
    const maxTokens = 600
    const maxTurns = 6
    const [contextStats, setContextStats] = useState<ContextStats | null>(null)

    // Cargar modelo
    useEffect(() => {
        let mounted = true
        const loadModel = async () => {
            if (!mounted) return
            setLoading(true)
            setLoadingProgress('Inicializando Walletfy AI...')
            try {
                const engineInstance = await webllm.CreateMLCEngine(SELECTED_MODEL, {
                    initProgressCallback: (p) => {
                        if (mounted) { setLoadingProgress(p.text) }
                    },
                    logLevel: 'WARN'
                })
                if (mounted) {
                    setEngine(engineInstance)
                    setLoadingProgress('Walletfy AI listo para usar!')
                }
            } catch (e) {
                console.error('Error cargando modelo:', e)
                if (mounted) setLoadingProgress('Error al cargar el modelo')
            } finally {
                if (mounted) setTimeout(() => setLoading(false), 600)
            }
        }
        loadModel()
        return () => { mounted = false }
    }, [])

    // Persistir historial
    useEffect(() => {
        if (chat.length > 0) localStorage.setItem('walletfy_chat_history', JSON.stringify(chat))
    }, [chat])

    const handleSend = async () => {
        if (!engine || !input.trim() || isProcessing) return
        setIsProcessing(true)

        const userMessage: ChatMessage = { role: 'user', content: input, timestamp: Date.now() }
        const updatedChat = [...chat, userMessage]
        setChat(updatedChat)
        setInput('')

        // Crear mensaje del asistente vacío para el streaming
        const assistantMessage: ChatMessage = {
            role: 'assistant',
            content: '',
            timestamp: Date.now()
        }
        setChat(prev => [...prev, assistantMessage])

        try {
            // Obtener datos y construir contexto
            const eventos = await DataRepo.getEvents()
            const { json, stats } = buildFinancialContext(eventos)
            setContextStats(stats)

            // Mensajes para el modelo
            const systemMsg: ChatMessage = {
                role: 'system',
                content: `${SYSTEM_PROMPT}\n\nJSON_DE_DATOS:\n${json}`
            }
            const conversation: ChatMessage[] = [
                systemMsg,
                ...getRecentConversation(updatedChat, maxTurns)
            ]

            // Streaming
            let fullReply = ''
            try {
                const stream = await engine.chat.completions.create({
                    messages: conversation,
                    temperature,
                    top_p: topP,
                    max_tokens: maxTokens,
                    stream: true
                })

                for await (const chunk of stream) {
                    const content = chunk.choices?.[0]?.delta?.content
                    if (content) {
                        fullReply += content
                        setChat(prev => {
                            const updated = [...prev]
                            const lastMessage = updated[updated.length - 1]
                            if (lastMessage && lastMessage.role === 'assistant') {
                                lastMessage.content = fullReply
                            }
                            return updated
                        })
                    }
                }

                if (!fullReply.trim()) {
                    setChat(prev => {
                        const updated = [...prev]
                        const lastMessage = updated[updated.length - 1]
                        if (lastMessage && lastMessage.role === 'assistant') {
                            lastMessage.content = 'No pude procesar la consulta con los datos disponibles.'
                        }
                        return updated
                    })
                }

            } catch (err: any) {
                const msg = String(err?.message || err)

                // Fallback si excede ventana de contexto
                if (msg.includes('ContextWindowSizeExceededError')) {
                    const { json: json12 } = buildFinancialContext(eventos, 3000)
                    const conv12: ChatMessage[] = [
                        { role: 'system', content: `${SYSTEM_PROMPT}\n\nJSON_DE_DATOS:\n${json12}` },
                        ...getRecentConversation(updatedChat, 3)
                    ]

                    fullReply = ''
                    setChat(prev => {
                        const updated = [...prev]
                        const lastMessage = updated[updated.length - 1]
                        if (lastMessage && lastMessage.role === 'assistant') {
                            lastMessage.content = ''
                        }
                        return updated
                    })

                    const stream2 = await engine.chat.completions.create({
                        messages: conv12,
                        temperature,
                        top_p: topP,
                        max_tokens: maxTokens,
                        stream: true
                    })

                    for await (const chunk of stream2) {
                        const content = chunk.choices?.[0]?.delta?.content
                        if (content) {
                            fullReply += content
                            setChat(prev => {
                                const updated = [...prev]
                                const lastMessage = updated[updated.length - 1]
                                if (lastMessage && lastMessage.role === 'assistant') {
                                    lastMessage.content = fullReply
                                }
                                return updated
                            })
                        }
                    }
                } else {
                    throw err
                }
            }

        } catch (error) {
            console.error('Error en el chat:', error)
            setChat(prev => {
                const updated = [...prev]
                const lastMessage = updated[updated.length - 1]
                if (lastMessage && lastMessage.role === 'assistant') {
                    lastMessage.content = 'Hubo un problema al procesar tu consulta. Intenta nuevamente.'
                }
                return updated
            })
        } finally {
            setIsProcessing(false)
        }
    }

    const clearChat = () => {
        setChat([])
        localStorage.removeItem('walletfy_chat_history')
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && e.ctrlKey) handleSend()
    }

    const suggestedQuestions = [
        '¿Cómo está mi situación financiera actual?',
        '¿En qué meses gasté más y menos?',
        '¿Cuál fue mi mejor y peor mes?',
        '¿Cómo cambió mi monto global?',
        'Dame 3 recomendaciones para mejorar'
    ]

    return (
        <div className="mt-10 p-6 bg-muted rounded-xl shadow-lg max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold">Walletfy AI - Asistente Financiero</h2>
                    <p className="text-sm text-muted-foreground mt-1">Tu asesor personal de finanzas con IA</p>
                </div>
                <div className="text-right">
                    <div className={`text-sm font-medium ${engine ? 'text-green-600' : 'text-red-600'}`}>
                        {engine ? 'Conectado' : 'Desconectado'}
                    </div>
                    {contextStats && (
                        <div className="text-xs text-muted-foreground">
                            {contextStats.monthsIncluded} meses | {contextStats.totalEvents} eventos
                        </div>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-violet-500 mx-auto mb-6"></div>
                    <p className="text-xl font-medium mb-2">Cargando Walletfy AI...</p>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">{loadingProgress}</p>
                    <div className="mt-4 text-xs text-muted-foreground">Esto puede tomar unos momentos la primera vez</div>
                </div>
            ) : (
                <>
                    {/* Panel de configuración sencillo */}
                    <div className="bg-card p-4 rounded-lg mb-4 border">
                        <h3 className="font-semibold mb-3 flex items-center">Configuración del Modelo</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                                <label className="block font-medium">Temperatura</label>
                                <input
                                    type="number"
                                    min={0}
                                    max={1}
                                    step={0.1}
                                    value={temperature}
                                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                    className="w-full border rounded px-3 py-2 text-xs"
                                />
                                <div className="text-xs text-muted-foreground">Creatividad (0=preciso, 1=creativo)</div>
                            </div>

                            <div className="space-y-2">
                                <label className="block font-medium">Top-P</label>
                                <input
                                    type="number"
                                    min={0}
                                    max={1}
                                    step={0.05}
                                    value={topP}
                                    onChange={(e) => setTopP(parseFloat(e.target.value))}
                                    className="w-full border rounded px-3 py-2 text-xs"
                                />
                                <div className="text-xs text-muted-foreground">Diversidad de respuesta (0.8-0.95 recomendado)</div>
                            </div>
                        </div>
                    </div>

                    {/* Chat */}
                    <div className="bg-card rounded-lg border mb-4 shadow-inner">
                        <div className="h-96 overflow-y-auto p-4 space-y-4">
                            {chat.length === 0 ? (
                                <div className="text-center text-muted-foreground py-12">
                                    <div className="text-6xl mb-4">💰</div>
                                    <h3 className="text-lg font-semibold mb-2">Hola! Soy tu Asistente Financiero</h3>
                                    <p className="mb-2">Puedo analizar tus ingresos, egresos, balances y acumulados</p>
                                    <p className="text-sm">Pregúntame lo que necesites</p>
                                </div>
                            ) : (
                                chat.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] px-4 py-3 rounded-lg ${msg.role === 'user' ? 'bg-violet-500 text-white' : 'bg-gray-100 text-gray-800 border'
                                            }`}>
                                            <div className="flex items-center gap-2 text-xs opacity-70 mb-2">
                                                <span>{msg.role === 'user' ? 'Tú' : 'Walletfy AI'}</span>
                                                {msg.timestamp && <span>• {new Date(msg.timestamp).toLocaleTimeString('es-ES')}</span>}
                                            </div>
                                            <div className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                            {isProcessing && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-100 rounded-lg px-4 py-3 border">
                                        <div className="flex items-center space-x-3">
                                            <div className="animate-pulse">🤖</div>
                                            <div className="text-sm">Analizando tus datos financieros...</div>
                                            <div className="flex space-x-1">
                                                <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sugerencias */}
                    {chat.length === 0 && (
                        <div className="mb-4">
                            <p className="text-sm font-medium mb-3">Preguntas que puedes hacerme:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {suggestedQuestions.map((q, i) => (
                                    <button
                                        key={i}
                                        className="text-left text-xs bg-violet-50 hover:bg-violet-100 text-violet-700 px-3 py-2 rounded-lg border border-violet-200 transition-colors"
                                        onClick={() => setInput(q)}
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Entrada */}
                    <div className="space-y-3">
                        <div className="flex gap-3">
                            <textarea
                                className="flex-1 p-4 rounded-lg border resize-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                rows={3}
                                placeholder="Escribe tu pregunta... (Ctrl + Enter para enviar)"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isProcessing}
                            />
                            <div className="flex flex-col gap-2">
                                <button
                                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${isProcessing || !input.trim()
                                        ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                                        : 'bg-violet-500 hover:bg-violet-600 text-white shadow-lg hover:shadow-xl'
                                        }`}
                                    onClick={handleSend}
                                    disabled={isProcessing || !input.trim()}
                                >
                                    {isProcessing ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                                            <span>Enviando</span>
                                        </div>
                                    ) : (
                                        'Enviar'
                                    )}
                                </button>
                                <button
                                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                                    onClick={clearChat}
                                >
                                    Limpiar
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                            <div className="flex items-center gap-4">
                                <span>{chat.filter(m => m.role === 'user').length} preguntas</span>
                                <span>{chat.filter(m => m.role === 'assistant').length} respuestas</span>
                                {contextStats && <span>{contextStats.approxTokens} tokens aprox.</span>}
                            </div>
                            <div>Qwen2.5 1.5B</div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}