import { BoardDetail } from "@/modules/boards/components/board-detail"

export default async function BoardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <BoardDetail id={id} />
}
