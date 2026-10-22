import { ButtonLink, Empty } from "@/components/ui";
export default function NotFound() {
  return (
    <div className="container page">
      <Empty
        title="This desk is unoccupied."
        description="The page you’re looking for isn’t on this trading floor."
      />
      <ButtonLink href="/">Back to headquarters</ButtonLink>
    </div>
  );
}
