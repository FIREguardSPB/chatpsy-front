import type { Meta, StoryObj } from '@storybook/react';
import { FeedbackForm } from './FeedbackForm';

const meta = {
  title: 'Components/FeedbackForm',
  component: FeedbackForm,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FeedbackForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {
  args: {
    onSent: (granted) => {
      console.log('Feedback sent, granted:', granted);
    },
  },
};

export const Open: Story = {
  args: {
    onSent: (granted) => {
      console.log('Feedback sent, granted:', granted);
    },
  },
  play: async ({ canvasElement }) => {
    const button = canvasElement.querySelector('button');
    button?.click();
  },
};
