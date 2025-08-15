import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SiliconFlowAPI } from '../siliconFlowAPI'

// Mock fetch
global.fetch = vi.fn()

const mockConfig = {
  apiKey: 'test-api-key',
  baseURL: 'https://api.siliconflow.cn/v1',
  model: 'Qwen/Qwen2.5-7B-Instruct'
}

describe('SiliconFlowAPI 测试', () => {
  let api: SiliconFlowAPI

  beforeEach(() => {
    api = new SiliconFlowAPI(mockConfig)
    vi.clearAllMocks()
  })

  describe('generateGameInfo', () => {
    it('应该成功生成游戏信息', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          choices: [{
            message: {
              content: JSON.stringify({
                title: '超级马里奥兄弟',
                description: '经典的横版闯关游戏',
                content: '这是一款经典的横版闯关游戏...',
                tags: ['经典', '横版', '冒险'],
                category: '动作冒险'
              })
            }
          }]
        })
      }

      ;(fetch as any).mockResolvedValue(mockResponse)

      const result = await api.generateGameInfo({
        gameName: '马里奥',
        gameType: '动作',
        keywords: ['经典', '任天堂']
      })

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.title).toBe('超级马里奥兄弟')
      expect(result.data?.category).toBe('动作冒险')
    })

    it('应该处理API错误响应', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      }

      ;(fetch as any).mockResolvedValue(mockResponse)

      const result = await api.generateGameInfo({
        gameName: '测试游戏'
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('API请求失败')
    })

    it('应该处理网络错误', async () => {
      ;(fetch as any).mockRejectedValue(new Error('Network error'))

      const result = await api.generateGameInfo({
        gameName: '测试游戏'
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Network error')
    })

    it('应该处理JSON解析错误', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          choices: [{
            message: {
              content: 'invalid json content'
            }
          }]
        })
      }

      ;(fetch as any).mockResolvedValue(mockResponse)

      const result = await api.generateGameInfo({
        gameName: '测试游戏'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('应该使用默认值当API返回不完整数据时', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          choices: [{
            message: {
              content: JSON.stringify({
                title: '完整标题'
                // 缺少其他字段
              })
            }
          }]
        })
      }

      ;(fetch as any).mockResolvedValue(mockResponse)

      const result = await api.generateGameInfo({
        gameName: '测试游戏'
      })

      expect(result.success).toBe(true)
      expect(result.data?.title).toBe('完整标题')
      expect(result.data?.description).toBe('')
      expect(result.data?.content).toBe('')
      expect(result.data?.tags).toEqual([])
      expect(result.data?.category).toBe('其他')
    })
  })

  describe('testConnection', () => {
    it('应该成功测试连接', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          choices: [{
            message: {
              content: '连接成功'
            }
          }]
        })
      }

      ;(fetch as any).mockResolvedValue(mockResponse)

      const result = await api.testConnection()

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('应该处理连接测试失败', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      }

      ;(fetch as any).mockResolvedValue(mockResponse)

      const result = await api.testConnection()

      expect(result.success).toBe(false)
      expect(result.error).toContain('连接失败')
    })
  })

  describe('buildPrompt', () => {
    it('应该正确构建请求参数', async () => {
      ;(fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: '{}' } }]
        })
      })

      await api.generateGameInfo({
        gameName: '测试游戏',
        gameType: '角色扮演',
        keywords: ['RPG', '冒险']
      })

      const fetchCall = (fetch as any).mock.calls[0]
      const requestBody = JSON.parse(fetchCall[1].body)
      
      expect(requestBody.model).toBe(mockConfig.model)
      expect(requestBody.messages).toHaveLength(2)
      expect(requestBody.messages[0].role).toBe('system')
      expect(requestBody.messages[1].role).toBe('user')
      expect(requestBody.messages[1].content).toContain('测试游戏')
      expect(requestBody.messages[1].content).toContain('角色扮演')
      expect(requestBody.messages[1].content).toContain('RPG, 冒险')
    })
  })
})