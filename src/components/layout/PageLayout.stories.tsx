import type { Meta, StoryObj } from '@storybook/react';

import { PageLayout } from './PageLayout';

const meta = {
  title: 'Components/PageLayout',
  component: PageLayout,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PageLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div style={{ padding: '20px' }}>
        <h1>Page Content</h1>
        <p>This is the main content area</p>
      </div>
    ),
  },
};

export const WithCards: Story = {
  args: {
    children: (
      <div className="content-grid">
        <div className="card">
          <h2 className="card__title">Card 1</h2>
          <p className="card__text">Sample card content</p>
        </div>
        <div className="card">
          <h2 className="card__title">Card 2</h2>
          <p className="card__text">Another card content</p>
        </div>
      </div>
    ),
  },
};
