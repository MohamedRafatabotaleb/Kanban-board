import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { DataContext } from "@/DataContext";
import Column from "./Column";
import { act, useContext, useMemo } from "react";
import { produce } from "immer";

const Workspace = () => {
  const { data, setData, selectedBoardIndex } = useContext(DataContext);
  const columns = data[selectedBoardIndex]?.columns || []; // Default to an empty array if undefined

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
  );

  const createNewColumn = (num) => ({
    id: Date.now(),
    title: `New Column ${num}`,
    tasks: [],
  });

  const addNewColumnHandler = () => {
    const num = columns.length;
    const newColumn = createNewColumn(num);

    setData((prev) =>
      produce(prev, (draft) => {
        if (draft[selectedBoardIndex]) {
          // Ensure index is valid
          draft[selectedBoardIndex].columns.push(newColumn);
        }
      }),
    );
  };

  const tasksIds = useMemo(() => {
    let tasksIds = [];

    if (columns && columns.length > 0) {
      // Ensure columns exists and has items
      columns.forEach((column) => {
        if (column.tasks && column.tasks.length > 0) {
          // Ensure tasks exists
          tasksIds = [...tasksIds, ...column.tasks.map((task) => task.id)];
        }
      });
    }

    return tasksIds;
  }, [columns]);

  const onDragEndHandler = (event) => {
    const { active, over } = event;
    if (!over) return; // Ensure 'over' is not undefined

    const activeId = active.id;
    const overId = over.id;
    const overColumnId = over.data.current.columnId;
    const activeColumnId = active.data.current.columnId;

    if (activeId === overId) return;

    if (activeColumnId === overColumnId) {
      const newColumns = columns.map((column) => {
        if (column.id === activeColumnId) {
          const activeIdIndex = column.tasks.findIndex(
            (task) => task.id === activeId,
          );
          const overIdIndex = column.tasks.findIndex(
            (task) => task.id === overId,
          );
          const tasks = arrayMove(column.tasks, activeIdIndex, overIdIndex);

          return { ...column, tasks };
        }
        return column;
      });

      setData((prev) =>
        produce(prev, (draft) => {
          draft[selectedBoardIndex].columns = newColumns;
        }),
      );
    }
  };

  const onDragOverHandler = (event) => {
    const { active, over } = event;
    if (!over) return; // Ensure 'over' is not undefined

    const activeId = active.id;
    const overColumnId = over?.data?.current?.columnId;
    const activeColumnId = active?.data?.current?.columnId;

    if (overColumnId && activeColumnId !== overColumnId) {
      const newColumns = columns.map((column) => {
        if (column.id === overColumnId) {
          const activeTask = columns
            .find((column) => column.id === activeColumnId)
            .tasks.find((task) => task.id === activeId);
          const tasks = [...column.tasks, activeTask];

          return { ...column, tasks };
        }

        if (column.id === activeColumnId) {
          const tasks = column.tasks.filter((task) => task.id !== activeId);

          return { ...column, tasks };
        }

        return column;
      });

      setData((prev) =>
        produce(prev, (draft) => {
          draft[selectedBoardIndex].columns = newColumns;
        }),
      );
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEndHandler}
      onDragOver={onDragOverHandler}
    >
      <div className="flex h-[calc(100vh-97px)] flex-1 gap-6 overflow-auto bg-light-grey p-6">
        <SortableContext
          items={tasksIds}
          strategy={verticalListSortingStrategy}
        >
          {columns.map((item, index) => (
            <Column
              key={`${item.id}${item.title}`}
              id={item.id}
              title={item.title}
              tasks={item.tasks}
              columnIndex={index}
            />
          ))}
        </SortableContext>
        <button
          className="w-72 shrink-0 self-start rounded-md bg-lines-light p-3 text-heading-l text-medium-grey"
          onClick={addNewColumnHandler}
        >
          + New Column
        </button>
      </div>
    </DndContext>
  );
};

export default Workspace;
