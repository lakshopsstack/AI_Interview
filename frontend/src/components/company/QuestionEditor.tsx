import React from 'react';
import MDEditor, { commands } from '@uiw/react-md-editor';
import { getCodeString } from 'rehype-rewrite';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { cn } from '@/lib/utils';

interface QuestionEditorProps {
  questionDescription: string;
  setQuestionDescription: (value: string) => void;
}
const QuestionEditor: React.FC<QuestionEditorProps> = ({
  questionDescription,
  setQuestionDescription,
}) => {
  return (
    <div className="w-full" data-color-mode="dark">
      <MDEditor
        value={questionDescription}
        onChange={(value) => setQuestionDescription(value || '')}
        className={cn(
          'rounded-md border border-border bg-background text-foreground',
          'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
          'min-h-[300px]'
        )}
        preview="live"
        height={300}
        previewOptions={{
          components: {
            code: ({ children = [], className, ...props }) => {
              // Handle KaTeX code blocks (e.g., ```katex ... ```)
              const code = props.node && props.node.children ? getCodeString(props.node.children) : children;
              if (
                typeof code === 'string' &&
                typeof className === 'string' &&
                /^language-katex/.test(className.toLocaleLowerCase())
              ) {
                const html = katex.renderToString(code, {
                  throwOnError: false,
                  displayMode: true,
                });
                return <code style={{ fontSize: '100%' }} dangerouslySetInnerHTML={{ __html: html }} />;
              }
              // Fallback for regular code
              return <code className={String(className)}>{children}</code>;
            },
          },
        }}
        commands={[
          commands.group([commands.title1, commands.title2, commands.title3, commands.title4, commands.title5, commands.title6], {
            name: 'title',
            groupName: 'title',
            buttonProps: { 'aria-label': 'Insert title' },
          }),
          commands.bold,
          commands.italic,
          commands.strikethrough,
          commands.hr,
          commands.divider,
          commands.link,
          commands.quote,
          commands.code,
          commands.codeBlock,
          commands.image,
          commands.divider,
          commands.unorderedListCommand,
          commands.orderedListCommand,
          commands.checkedListCommand,
          commands.divider,
          commands.table,
          commands.help,
        ]}
        extraCommands={[
          commands.codeEdit,
          commands.codeLive,
          commands.fullscreen,
          commands.divider,
        ]}
      />
    </div>
  );
};

export default QuestionEditor;