export interface Project {
    id: number
    title: string
    description: string
    author: string
    author_avatar: string
    tags: string[]
    stars: number
    image: string
    github_url?: string
    demo_url?: string
    created_at: string
    updated_at: string
    featured: boolean
    status: 'draft' | 'published' | 'archived'
  }
  
  export interface ProjectInsert {
    title: string
    description: string
    author: string
    author_avatar: string
    tags: string[]
    stars?: number
    image: string
    github_url?: string
    demo_url?: string
    featured?: boolean
    status?: 'draft' | 'published' | 'archived'
  }
  
  export interface ProjectUpdate {
    title?: string
    description?: string
    author?: string
    author_avatar?: string
    tags?: string[]
    stars?: number
    image?: string
    github_url?: string
    demo_url?: string
    featured?: boolean
    status?: 'draft' | 'published' | 'archived'
  }  