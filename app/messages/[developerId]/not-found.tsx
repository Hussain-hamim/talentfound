import Link from 'next/link';
export default function ConversationNotFound() {
  return <div className="hiring-empty"><h1>That developer isn’t here.</h1><p>Choose a developer from the directory to start a conversation.</p><Link className="button button-red" href="/messages">Back to messages</Link></div>;
}
