import { CommentData, ListData, UserData, PageData } from '~/types/artalk-data'
import Context from '../Context'

export default class Api {
  private ctx: Context
  private serverURL: string

  constructor (ctx: Context) {
    this.ctx = ctx
    this.serverURL = ctx.conf.serverUrl
  }

  public get(offset: number): Promise<ListData> {
    const params = getFormData({
      page_key: this.ctx.conf.pageKey,
      limit: this.ctx.conf.readMore?.pageSize || 15,
      offset,
    })

    return commonFetch(this.ctx, `${this.serverURL}/get`, {
      method: 'POST',
      body: params,
    }).then((json) => (json.data as ListData))
  }

  public add(comment: { nick: string, email: string, link: string, content: string, rid: number }): Promise<CommentData> {
    const params = getFormData({
      name: comment.nick,
      email: comment.email,
      link: comment.link,
      content: comment.content,
      rid: comment.rid,
      page_key: this.ctx.conf.pageKey,
      token: this.ctx.user.data.token,
    })

    return commonFetch(this.ctx, `${this.serverURL}/add`, {
      method: 'POST',
      body: params,
    }).then((json) => (json.data.comment as CommentData))
  }

  public login(name: string, email: string, password: string): Promise<string> {
    const params = getFormData({
      name, email, password
    })

    return commonFetch(this.ctx, `${this.serverURL}/login`, {
      method: 'POST',
      body: params,
    }).then((json) => (json.data.token))
  }

  public userGet(name: string, email: string, token: string) {
    const ctrl = new AbortController()
    const { signal } = ctrl

    const params = getFormData({
      name, email, token
    })

    const req = commonFetch(this.ctx, `${this.serverURL}/user-get`, {
      method: 'POST',
      body: params,
      signal,
    }).then((json) => ({
      user: json.data.user as UserData|null,
      is_login: json.data.is_login as boolean
    }))

    return {
      req,
      abort: () => { ctrl.abort() },
    }
  }

  public userVerify(token: string) {
    const params = getFormData({
      token
    })

    return commonFetch(this.ctx, `${this.serverURL}/user-get`, {
      method: 'POST',
      body: params,
    }).then((json) => (json.data.user as UserData))
  }

  public captchaGet(): Promise<string> {
    return commonFetch(this.ctx, `${this.serverURL}/captcha/refresh`, {
      method: 'GET',
    }).then((json) => {
      if (!!json.success && !!json.data.img_data) {
        return json.data.img_data
      }

      return ''
    })
  }

  public captchaCheck(value: string): Promise<string> {
    return commonFetch(this.ctx, `${this.serverURL}/captcha/check?${new URLSearchParams({ value })}`, {
      method: 'GET',
    }).then((json) => {
      if (!json.success && !!json.data.img_data) {
        return json.data.img_data
      }

      return ''
    })
  }

  public editComment(comment: CommentData) {
    const params = getFormData({
      ...comment,
      token: this.ctx.user.data.token
    })

    return commonFetch(this.ctx, `${this.serverURL}/manager/edit-comment`, {
      method: 'POST',
      body: params,
    }).then((json) => (json.data.comment as CommentData))
  }

  public editPage(key: string, onlyAdmin: boolean) {
    const params = getFormData({
      key,
      only_admin: onlyAdmin ? '1' : '0',
      token: this.ctx.user.data.token
    })

    return commonFetch(this.ctx, `${this.serverURL}/manager/edit-page`, {
      method: 'POST',
      body: params,
    }).then((json) => (json.data.page as PageData))
  }
}

function commonFetch(ctx: Context, input: RequestInfo, init?: RequestInit | undefined): Promise<any> {
  return timeoutPromise(4000, fetch(input, init)).then(async (resp) => {
    // 解析获取响应的 json
    let json: any = await resp.json()

    // 重新发起请求
    const recall = (resolve, reject) => {
      commonFetch(ctx, input, init).then(d => {
        resolve(d)
      }).catch(err => {
        reject(err)
      })
    }

    if (json.data && json.data.need_captcha) {
      // 请求需要验证码
      json = await (new Promise<any>((resolve, reject) => {
        ctx.dispatchEvent('checker-captcha', {
          imgData: json.data.img_data,
          onSuccess: () => {
            recall(resolve, reject)
          },
          onCancel: () => {
            reject(json)
          }
        })
      }))
    } else if (json.data && json.data.need_login) {
      // 请求需要管理员权限
      json = await (new Promise<any>((resolve, reject) => {
        ctx.dispatchEvent('checker-admin', {
          onSuccess: () => {
            recall(resolve, reject)
          },
          onCancel: () => {
            reject(json)
          }
        })
      }))
    }

    if (!json.success)
      throw json // throw 相当于 reject(json)
    else
      return json
  })
}

function getFormData (object: any): FormData {
  const formData = new FormData()
  Object.keys(object).forEach(key => formData.append(key, String(object[key])))
  return formData
}

/** TODO: 我靠，一个 timeout，都要丑陋的实现 */
function timeoutPromise<T>(ms: number, promise: Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error("promise timeout"))
    }, ms);
    promise.then(
      (res) => {
        clearTimeout(timeoutId);
        resolve(res);
      },
      (err) => {
        clearTimeout(timeoutId);
        reject(err);
      }
    );
  })
}
