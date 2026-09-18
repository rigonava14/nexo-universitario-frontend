import { CheckCircle2, Clock3, Eye, GripVertical, Plus, Settings2, Trash2 } from 'lucide-react'
import { InstitutionSettings } from './institution'

type Exam = InstitutionSettings['admissionExam']
type Question = Exam['questions'][number]

type Props = { exam: Exam; onChange: (exam: Exam) => void }

export default function AdmissionExamBuilder({ exam, onChange }: Props) {
  function field<K extends keyof Exam>(key: K, value: Exam[K]) { onChange({ ...exam, [key]: value }) }
  function updateQuestion(index: number, patch: Partial<Question>) {
    field('questions', exam.questions.map((question, itemIndex) => itemIndex === index ? { ...question, ...patch } : question))
  }
  function addQuestion() {
    field('questions', [...exam.questions, {
      id: `q-${Date.now()}`,
      type: 'multiple-choice',
      category: 'Nueva categoría',
      prompt: 'Escribe aquí el reactivo',
      points: 10,
      options: [{ id: 'a', text: 'Opción A', correct: true }, { id: 'b', text: 'Opción B', correct: false }],
    }])
  }
  function updateOption(questionIndex: number, optionIndex: number, value: string) {
    const question = exam.questions[questionIndex]
    updateQuestion(questionIndex, { options: question.options.map((option, index) => index === optionIndex ? { ...option, text: value } : option) })
  }
  function setCorrect(questionIndex: number, optionIndex: number) {
    const question = exam.questions[questionIndex]
    updateQuestion(questionIndex, { options: question.options.map((option, index) => ({ ...option, correct: index === optionIndex })) })
  }
  function addOption(questionIndex: number) {
    const question = exam.questions[questionIndex]
    updateQuestion(questionIndex, { options: [...question.options, { id: String.fromCharCode(97 + question.options.length), text: `Opción ${String.fromCharCode(65 + question.options.length)}`, correct: false }] })
  }

  const totalPoints = exam.questions.reduce((sum, question) => sum + question.points, 0)

  return <div className="exam-builder-grid">
    <div className="control-stack">
      <section className="school-control-card">
        <header><span><Settings2 size={21} /></span><div><h2>Configuración del examen</h2><p>Define aplicación, intento y comportamiento general.</p></div></header>
        <div className="school-fields four">
          <label className="field-wide">Nombre del examen<input value={exam.name} onChange={(event) => field('name', event.target.value)} /></label>
          <label>Duración (minutos)<input type="number" min="1" value={exam.durationMinutes} onChange={(event) => field('durationMinutes', Number(event.target.value))} /></label>
          <label>Puntaje aprobatorio<input type="number" min="0" value={exam.passingScore} onChange={(event) => field('passingScore', Number(event.target.value))} /></label>
          <label>Intentos permitidos<input type="number" min="1" value={exam.attempts} onChange={(event) => field('attempts', Number(event.target.value))} /></label>
          <label className="field-wide">Instrucciones<textarea rows={3} value={exam.instructions} onChange={(event) => field('instructions', event.target.value)} /></label>
        </div>
        <div className="exam-switches">
          <label><input type="checkbox" checked={exam.randomizeQuestions} onChange={(event) => field('randomizeQuestions', event.target.checked)} /><span><strong>Mezclar reactivos</strong><small>Orden diferente por aspirante</small></span></label>
          <label><input type="checkbox" checked={exam.randomizeAnswers} onChange={(event) => field('randomizeAnswers', event.target.checked)} /><span><strong>Mezclar respuestas</strong><small>Reduce patrones predecibles</small></span></label>
          <label><input type="checkbox" checked={exam.showResult} onChange={(event) => field('showResult', event.target.checked)} /><span><strong>Mostrar resultado</strong><small>Al finalizar el intento</small></span></label>
        </div>
      </section>

      <section className="school-control-card question-bank-card">
        <header className="with-action"><span><CheckCircle2 size={21} /></span><div><h2>Banco de reactivos</h2><p>{exam.questions.length} reactivos · {totalPoints} puntos configurados</p></div><button type="button" onClick={addQuestion}><Plus size={17} /> Nuevo reactivo</button></header>
        <div className="question-list">{exam.questions.map((question, questionIndex) => <article className="question-editor" key={question.id}>
          <div className="question-editor-top"><GripVertical size={18} /><span>REACTIVO {questionIndex + 1}</span><label>Categoría<input value={question.category} onChange={(event) => updateQuestion(questionIndex, { category: event.target.value })} /></label><label>Puntos<input type="number" min="1" value={question.points} onChange={(event) => updateQuestion(questionIndex, { points: Number(event.target.value) })} /></label><button type="button" aria-label="Eliminar reactivo" disabled={exam.questions.length === 1} onClick={() => field('questions', exam.questions.filter((_, index) => index !== questionIndex))}><Trash2 size={16} /></button></div>
          <textarea className="question-prompt" rows={2} value={question.prompt} onChange={(event) => updateQuestion(questionIndex, { prompt: event.target.value })} />
          <div className="option-list">{question.options.map((option, optionIndex) => <div key={option.id}><input type="radio" name={`correct-${question.id}`} checked={option.correct} onChange={() => setCorrect(questionIndex, optionIndex)} aria-label="Respuesta correcta" /><span>{String.fromCharCode(65 + optionIndex)}</span><input value={option.text} onChange={(event) => updateOption(questionIndex, optionIndex, event.target.value)} /><button type="button" aria-label="Eliminar opción" disabled={question.options.length <= 2} onClick={() => updateQuestion(questionIndex, { options: question.options.filter((_, index) => index !== optionIndex) })}><Trash2 size={14} /></button></div>)}</div>
          <button className="add-option" type="button" onClick={() => addOption(questionIndex)}><Plus size={14} /> Agregar opción</button>
        </article>)}</div>
      </section>
    </div>

    <aside className="exam-preview-panel">
      <div className="preview-label"><Eye size={16} /> VISTA DEL ASPIRANTE</div>
      <div className="exam-preview-paper"><div className="exam-preview-head"><div><small>EXAMEN DE ADMISIÓN</small><strong>{exam.name}</strong></div><span><Clock3 size={15} /> {exam.durationMinutes}:00</span></div><div className="exam-progress"><i /><small>Reactivo 1 de {exam.questions.length}</small></div>{exam.questions[0] && <div className="exam-question-preview"><span>{exam.questions[0].category} · {exam.questions[0].points} puntos</span><h3>{exam.questions[0].prompt}</h3>{exam.questions[0].options.map((option, index) => <label key={option.id}><input type="radio" name="exam-preview" /><i>{String.fromCharCode(65 + index)}</i>{option.text}</label>)}<button type="button">Siguiente reactivo</button></div>}</div>
    </aside>
  </div>
}
