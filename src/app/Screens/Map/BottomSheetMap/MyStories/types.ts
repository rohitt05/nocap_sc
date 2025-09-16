export interface Story {
  id: string;
  media_url: string;
  caption: string;
  location_name: string;
  created_at: string;
  signedUrl?: string;
}

export interface StoryCardProps {
  story: Story;
  index: number;
  onLayout?: (height: number, index: number) => void;
}

export interface MasonryColumnData {
  data: Story[];
  height: number;
}

export interface MasonryColumnProps {
  stories: Story[];
  columnIndex: number;
}

export interface MasonryLayoutProps {
  columns: MasonryColumnData[];
}
