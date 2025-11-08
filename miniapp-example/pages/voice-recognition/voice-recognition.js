// miniapp-example/pages/voice-recognition/voice-recognition.js
const app = getApp()
const recorderManager = wx.getRecorderManager()

Page({
  data: {
    isRecording: false,
    recognizedText: '',
    audioTime: 0,
    recordStatus: '准备就绪',
    historyList: [],
    stats: {
      totalCount: 0,
      todayCount: 0
    }
  },

  onLoad() {
    this.initRecorder()
    this.loadHistory()
    this.loadStats()
  },

  /**
   * 初始化录音管理器
   */
  initRecorder() {
    // 录音开始事件
    recorderManager.onStart(() => {
      console.log('录音开始')
      this.setData({
        isRecording: true,
        recordStatus: '录音中...',
        recognizedText: ''
      })
    })

    // 录音停止事件
    recorderManager.onStop((res) => {
      console.log('录音停止', res)
      this.setData({
        isRecording: false,
        recordStatus: '识别中...'
      })

      // 上传音频进行识别
      this.uploadAndRecognize(res.tempFilePath, res.duration)
    })

    // 录音错误事件
    recorderManager.onError((res) => {
      console.error('录音错误', res)
      this.setData({
        isRecording: false,
        recordStatus: '录音失败'
      })
      wx.showToast({
        title: '录音失败',
        icon: 'none'
      })
    })
  },

  /**
   * 开始录音
   */
  startRecord() {
    // 检查录音权限
    wx.authorize({
      scope: 'scope.record',
      success: () => {
        this.startRecording()
      },
      fail: () => {
        wx.showModal({
          title: '需要录音权限',
          content: '请在设置中开启录音权限',
          success: (res) => {
            if (res.confirm) {
              wx.openSetting()
            }
          }
        })
      }
    })
  },

  /**
   * 开始录音
   */
  startRecording() {
    const options = {
      duration: 60000, // 最长录音时长60秒
      sampleRate: 16000, // 采样率16kHz
      numberOfChannels: 1, // 单声道
      encodeBitRate: 48000, // 编码码率
      format: 'mp3', // 音频格式：mp3较通用
      frameSize: 10 // 指定帧大小
    }

    recorderManager.start(options)
  },

  /**
   * 停止录音
   */
  stopRecord() {
    recorderManager.stop()
  },

  /**
   * 长按开始录音
   */
  onTouchStart() {
    this.startRecord()
  },

  /**
   * 松开停止录音
   */
  onTouchEnd() {
    if (this.data.isRecording) {
      this.stopRecord()
    }
  },

  /**
   * 点击开始/停止录音（切换模式）
   */
  toggleRecord() {
    if (this.data.isRecording) {
      this.stopRecord()
    } else {
      this.startRecord()
    }
  },

  /**
   * 上传音频并识别
   */
  uploadAndRecognize(filePath, duration) {
    const token = wx.getStorageSync('token')
    
    if (!token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '识别中...'
    })

    wx.uploadFile({
      url: `${app.globalData.apiUrl}/api/voice-recognition/realtime`,
      filePath: filePath,
      name: 'audio',
      header: {
        'token': token
      },
      formData: {
        engineType: '16k_zh',
        filterDirty: '1', // 过滤脏词
        convertNumMode: '1' // 转换数字
      },
      success: (res) => {
        wx.hideLoading()
        
        if (res.statusCode === 200) {
          const data = JSON.parse(res.data)
          
          if (data.code === 0) {
            this.setData({
              recognizedText: data.data.text || '未识别到内容',
              audioTime: data.data.audioTime || duration,
              recordStatus: '识别完成'
            })

            wx.showToast({
              title: '识别成功',
              icon: 'success'
            })

            // 刷新历史记录
            this.loadHistory()
            this.loadStats()
          } else {
            this.showError(data.message || '识别失败')
          }
        } else {
          this.showError('网络错误')
        }
      },
      fail: (err) => {
        wx.hideLoading()
        console.error('上传失败', err)
        this.showError('上传失败')
      }
    })
  },

  /**
   * 一句话识别（从相册选择音频）
   */
  selectAudioFile() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['mp3', 'wav', 'm4a', 'aac'],
      success: (res) => {
        const file = res.tempFiles[0]
        
        // 检查文件大小（不超过2MB）
        if (file.size > 2 * 1024 * 1024) {
          wx.showToast({
            title: '文件过大，请选择2MB以内的音频',
            icon: 'none',
            duration: 2000
          })
          return
        }

        this.uploadFileAndRecognize(file.path, 'sentence')
      }
    })
  },

  /**
   * 上传文件并识别
   */
  uploadFileAndRecognize(filePath, type = 'sentence') {
    const token = wx.getStorageSync('token')

    wx.showLoading({
      title: '识别中...'
    })

    wx.uploadFile({
      url: `${app.globalData.apiUrl}/api/voice-recognition/${type}`,
      filePath: filePath,
      name: 'audio',
      header: {
        'token': token
      },
      formData: {
        engineType: '16k_zh',
        filterDirty: '1',
        convertNumMode: '1'
      },
      success: (res) => {
        wx.hideLoading()
        
        if (res.statusCode === 200) {
          const data = JSON.parse(res.data)
          
          if (data.code === 0) {
            this.setData({
              recognizedText: data.data.text || '未识别到内容',
              audioTime: data.data.audioTime || 0,
              recordStatus: '识别完成'
            })

            wx.showToast({
              title: '识别成功',
              icon: 'success'
            })

            this.loadHistory()
            this.loadStats()
          } else {
            this.showError(data.message || '识别失败')
          }
        } else {
          this.showError('网络错误')
        }
      },
      fail: (err) => {
        wx.hideLoading()
        console.error('上传失败', err)
        this.showError('上传失败')
      }
    })
  },

  /**
   * 复制识别结果
   */
  copyText() {
    if (!this.data.recognizedText) {
      wx.showToast({
        title: '没有可复制的内容',
        icon: 'none'
      })
      return
    }

    wx.setClipboardData({
      data: this.data.recognizedText,
      success: () => {
        wx.showToast({
          title: '已复制',
          icon: 'success'
        })
      }
    })
  },

  /**
   * 清空识别结果
   */
  clearText() {
    this.setData({
      recognizedText: '',
      audioTime: 0,
      recordStatus: '准备就绪'
    })
  },

  /**
   * 加载识别历史
   */
  loadHistory() {
    const token = wx.getStorageSync('token')

    wx.request({
      url: `${app.globalData.apiUrl}/api/voice-recognition/history`,
      method: 'GET',
      header: {
        'token': token
      },
      data: {
        page: 1,
        pageSize: 10
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 0) {
          this.setData({
            historyList: res.data.data.list
          })
        }
      }
    })
  },

  /**
   * 加载统计信息
   */
  loadStats() {
    const token = wx.getStorageSync('token')

    wx.request({
      url: `${app.globalData.apiUrl}/api/voice-recognition/stats`,
      method: 'GET',
      header: {
        'token': token
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 0) {
          this.setData({
            stats: res.data.data
          })
        }
      }
    })
  },

  /**
   * 查看历史详情
   */
  viewHistory(e) {
    const item = e.currentTarget.dataset.item
    
    this.setData({
      recognizedText: item.recognizedText,
      audioTime: item.audioTime,
      recordStatus: '历史记录'
    })
  },

  /**
   * 删除历史记录
   */
  deleteHistory(e) {
    const id = e.currentTarget.dataset.id
    const token = wx.getStorageSync('token')

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: `${app.globalData.apiUrl}/api/voice-recognition/history/${id}`,
            method: 'DELETE',
            header: {
              'token': token
            },
            success: (res) => {
              if (res.statusCode === 200 && res.data.code === 0) {
                wx.showToast({
                  title: '删除成功',
                  icon: 'success'
                })
                this.loadHistory()
                this.loadStats()
              }
            }
          })
        }
      }
    })
  },

  /**
   * 应用到监理日志
   * 将识别的文字填入监理日志表单
   */
  applyToLog() {
    if (!this.data.recognizedText) {
      wx.showToast({
        title: '没有可应用的内容',
        icon: 'none'
      })
      return
    }

    // 保存到缓存，供监理日志页面使用
    wx.setStorageSync('voiceRecognitionText', this.data.recognizedText)

    wx.showToast({
      title: '已保存，可在日志表单中使用',
      icon: 'success',
      duration: 2000
    })

    // 可以选择直接跳转到监理日志编辑页面
    // wx.navigateTo({
    //   url: '/pages/supervision-log/edit'
    // })
  },

  /**
   * 显示错误信息
   */
  showError(message) {
    this.setData({
      recordStatus: '识别失败'
    })
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    })
  }
})

