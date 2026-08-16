export function CreateForm() {
  return (
    <form className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="Title"
        className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <textarea
        placeholder="Content"
        className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600 transition-colors duration-300"
      >
        Create
      </button>
    </form>
  )
}
