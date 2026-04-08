import { useState } from "react";

import { DollarSign, Layers, Plus, Trash2 } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { CustomDroppable } from "../../../../../../../components/CustomDroppable.jsx";
import EditLesson from "./EditLesson/EditLesson.jsx";

function EditListLesson( { lessons, addLesson, removeLesson, updateLesson, moveLesson } ) {
    const handleDragEnd = (result) => {
            if (!result.destination) return;
            moveLesson(result.source.index, result.destination.index);
        };
    
    const [openPopupDetailLesson, setOpenPopupDetailLesson] = useState(false);
    const [lessonIndex, setLessonIndex] = useState(null);

    function togglePopup(index){
        setLessonIndex(index);
        setOpenPopupDetailLesson(!openPopupDetailLesson);
    }
    
    return (
        <div className="mt-3 space-y-3">
            <div className="p-3 pb-3 gap-3 space-y-2">
                <DragDropContext onDragEnd={handleDragEnd}>
                    <CustomDroppable droppableId="lessons"
                        isDropDisabled={false} 
                        isCombineEnabled={false}
                        ignoreContainerClipping={false}
                        direction="vertical"
                    >
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="grid gap-3"
                            >
                                {lessons.map((l, index) => (
                                    <Draggable
                                        key={l.id}
                                        draggableId={`lesson-${l.id}`}
                                        index={index}
                                    >
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className={`rounded-lg border p-3 grid gap-2  ${
                                                    snapshot.isDragging ? "bg-gray-100" : ""
                                                }`}>

                                                <input
                                                    value={l.title}
                                                    onChange={(e) => updateLesson(l.id, "title", e.target.value)}
                                                    placeholder="Tiêu đề bài học"
                                                    className="rounded-lg border px-3 py-2 text-sm"
                                                />
                                                <input
                                                    type="number"
                                                    min="0"
                                                    pattern="^[0-9]*$"
                                                    value={l.duration}
                                                    onChange={(e) => updateLesson(l.id, "duration", e.target.value)}
                                                    placeholder="minutes"
                                                    className="rounded-lg border px-3 py-2 text-sm"
                                                />
                                                <div className="flex place-content-between">
                                                    <button 
                                                        onClick={() => togglePopup(index)}
                                                        className="rounded-lg flex-start border px-3 py-2 text-sm bg-transparent hover:bg-gray-50 inline-flex items-center gap-2"
                                                    >
                                                        Detail Lesson
                                                    </button>
                                                    <button
                                                        onClick={() => removeLesson(index)}
                                                        className="rounded-lg flex-end border px-3 py-2 text-sm bg-transparent hover:bg-gray-50 inline-flex items-center gap-2"
                                                    >
                                                        <Trash2 className="w-4 h-4 bg-transparent text-rose-600" />{" "}
                                                        Xoá
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </CustomDroppable>
                </DragDropContext>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={() => addLesson()}
                    className="text-sm rounded-lg border bg-transparent px-3 py-2 hover:bg-gray-50 inline-flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Thêm bài học
                </button>
            </div>

            <EditLesson 
                lesson={lessons[lessonIndex]} 
                index={lessonIndex} 
                updateLesson={updateLesson}
                openPopupDetailLesson={openPopupDetailLesson} 
                setOpenPopupDetailLesson={setOpenPopupDetailLesson} 
            />
        
        </div>
    )
}

export default EditListLesson;