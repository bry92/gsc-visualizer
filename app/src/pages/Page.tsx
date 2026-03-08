import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

type Todo = {
  id: number;
  task: string;
};

function Page() {
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    const getTodos = async () => {
      const { data, error } = await supabase
        .from('todos')
        .select('id, task')
        .order('id', { ascending: true });

      if (error) {
        console.error('Failed to fetch todos:', error.message);
        return;
      }

      if (data && data.length > 0) {
        setTodos(data as Todo[]);
      }
    };

    void getTodos();
  }, []);

  return (
    <div className="p-6 text-text-primary">
      <h1 className="text-2xl font-semibold mb-4">Todos</h1>
      <ul className="space-y-2 list-disc list-inside">
        {todos.map((todo) => (
          <li key={todo.id}>{todo.task}</li>
        ))}
      </ul>
    </div>
  );
}

export default Page;
