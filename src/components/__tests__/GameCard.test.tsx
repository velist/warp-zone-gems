import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GameCard } from '../GameCard'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

const mockGame = {
  id: 'test-game-1',
  title: '超级马里奥兄弟',
  description: '经典的横版闯关游戏',
  cover_image: 'https://example.com/mario.jpg',
  category: '动作冒险',
  tags: ['经典', '横版', '任天堂'],
  author: '任天堂',
  published_at: '2024-01-15T00:00:00Z',
}

describe('GameCard 组件测试', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('应该正确渲染游戏信息', () => {
    render(<GameCard game={mockGame} />)
    
    expect(screen.getByText('超级马里奥兄弟')).toBeInTheDocument()
    expect(screen.getByText('经典的横版闯关游戏')).toBeInTheDocument()
    expect(screen.getByText('动作冒险')).toBeInTheDocument()
    expect(screen.getByText('任天堂')).toBeInTheDocument()
  })

  it('应该显示游戏标签', () => {
    render(<GameCard game={mockGame} />)
    
    expect(screen.getByText('经典')).toBeInTheDocument()
    expect(screen.getByText('横版')).toBeInTheDocument()
    expect(screen.getByText('任天堂')).toBeInTheDocument()
  })

  it('当点击卡片时应该导航到游戏详情页', () => {
    render(<GameCard game={mockGame} />)
    
    const card = screen.getByRole('button', { name: /立即下载/i }).closest('.block-card')
    fireEvent.click(card!)
    
    expect(mockNavigate).toHaveBeenCalledWith('/game/test-game-1')
  })

  it('当游戏没有封面图片时应该显示默认图标', () => {
    const gameWithoutImage = { ...mockGame, cover_image: undefined }
    render(<GameCard game={gameWithoutImage} />)
    
    expect(screen.getByText('📷')).toBeInTheDocument()
  })

  it('应该正确格式化发布日期', () => {
    render(<GameCard game={mockGame} />)
    
    // 查找包含日期的元素
    const dateElement = screen.getByText(/2024/)
    expect(dateElement).toBeInTheDocument()
  })

  it('当标签数量超过3个时应该显示省略号', () => {
    const gameWithManyTags = {
      ...mockGame,
      tags: ['经典', '横版', '任天堂', '街机', '复古']
    }
    render(<GameCard game={gameWithManyTags} />)
    
    expect(screen.getByText('+2')).toBeInTheDocument()
  })

  it('预览按钮应该阻止事件冒泡', () => {
    render(<GameCard game={mockGame} />)
    
    // 需要先触发hover效果
    const cardHeader = screen.getByText('超级马里奥兄弟').closest('.block-card')
    fireEvent.mouseEnter(cardHeader!)
    
    const previewButton = screen.getByText('预览').closest('button')
    fireEvent.click(previewButton!)
    
    expect(mockNavigate).toHaveBeenCalledWith('/game/test-game-1')
  })

  it('应该显示评分和下载量', () => {
    render(<GameCard game={mockGame} />)
    
    expect(screen.getByText('4.8')).toBeInTheDocument()
    // 查找下载量数字（排除日期）
    const downloadCount = screen.getByText(/^\d{3,}$/) // 匹配3位或以上的纯数字
    expect(downloadCount).toBeInTheDocument()
  })
})