import type { Meta, StoryObj } from '@storybook/react';
import { ChatUploadForm } from './ChatUploadForm';

const meta = {
  title: 'Components/ChatUploadForm',
  component: ChatUploadForm,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ChatUploadForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onChatReady: (payload) => {
      console.log('Chat ready:', payload);
    },
  },
};

export const WithFiles: Story = {
  args: {
    onChatReady: (payload) => {
      console.log('Chat ready:', payload);
    },
  },
  play: async ({ canvasElement }) => {
    // Simulate file upload
    console.log('File upload simulation', canvasElement);
  },
};
