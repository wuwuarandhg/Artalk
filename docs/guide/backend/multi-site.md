# 管理员 × 多站点

Artalk 支持站点隔离，以及为站点分配指定的管理员账户，

所以，你可以实现两种模式：单人多站点、多人多站点。

运用「单人多站点」模式，你能够实现多个站点共用同一个 Artalk 后端程序，集中化管理。

运用「多人多站点」模式，你可以和你的朋友们共用同一个 Artalk 后端程序。😉

## 创建超级管理员

执行命令根据命令行提示快速创建超级管理员。

```sh
./artalk admin
```

如果使用 Docker 可以执行以下命令：

```sh
docker exec -it artalk artalk admin
```

之后可使用超级管理员账户登陆控制中心，在用户管理页面的图形界面可创建更多账户，而无需手动编辑配置文件。

## 站点的创建和管理

你可以在侧边栏「[控制中心](../frontend/sidebar.md#控制中心)」创建多个站点，管理站点和快速切换站点，详情可参考：[“侧边栏”](/guide/frontend/sidebar.html)。

## 管理员配置

你可以设置多个管理员账户，当输入框输入匹配管理员用户名和邮箱时，将弹出密码验证提示框，

并且只有管理员才能访问侧边栏「[控制中心](../frontend/sidebar.md#控制中心)」，在前端对评论内容进行管理操作。

在配置文件中添加如下内容：

```yaml
admin_users:
  - name: "admin"
    email: "admin@example.com"
    password: ""
    badge_name: "管理员"
    badge_color: "#0083FF"
  - name: "admin2"
    email: "admin2@example.com"
    password: ""
    badge_name: "小管理员"
    badge_color: "#0083FF"
```

每一项配置的解释：

- **name** & **email**：用户名和邮箱，**不区分大小写**。
- **password**：用户密码。

  支持 bcrypt 和 md5 加密，例如填写：`"(md5)50c21190c6e4e5418c6a90d2b5031119"`。

  **建议使用更安全的 bcrypt 加密算法**，在 Linux 环境下，你可以使用 [htpasswd 命令](https://httpd.apache.org/docs/2.4/programs/htpasswd.html) 来生成密文：

  ```bash
  unset HISTFILE # 临时禁用 history 防止密码在历史记录中出现
  htpasswd -bnBC 10 "" "your_password" | tr -d ':'
  ```

  然后配置填写：`"(bcrypt)$2y$10$ti4vZYIrxVN8rLcY..."`，以 `(bcrypt)` 开头。

  命令解释参考：[“Compute bcrypt hash from command line”](https://unix.stackexchange.com/questions/307994/compute-bcrypt-hash-from-command-line#answer-419855)

- **badge_name**：用户显示的头衔徽标文字。
- **badge_color**：用户显示的头衔徽标背景颜色。

## 超级管理员、普通管理员

管理员分为「超级管理员」和「普通管理员」，前者可以管理全部站点，后者只能管理部分站点。

普通管理员将：

  - 不会收到其它站点的评论邮件通知，邮件通知彼此隔离。
  - 不能对设定范围外的站点进行 删除、修改、查询 等操作。
  - 仅能在受限模式下使用 数据导入导出、站点管理 等功能。

完整的 `admin_users` 配置如下：

```yaml
admin_users:
  - name: "超级管理员"
    email: "super_admin@example.com"
    password: "(bcrypt)$2y$10$ti4vZYIrxVN8rLcYXVgXCO.GJND0dyI49r7IoF3xqIx8bBRmIBZRm"
    badge_name: "超级管理员"
    badge_color: "#0083ff"
    receive_email: false

  - name: "普通管理员1"
    email: "admin1@example.com"
    password: "(bcrypt)$2y$10$ti4vZYIrxVN8rLcYXVgXCO.GJND0dyI49r7IoF3xqIx8bBRmIBZRm"
    badge_name: "管理员"
    badge_color: "#0083ff"
    sites:
      - 站点名 A
      - 站点名 B

  - name: "普通管理员2"
    email: "admin2@example.com"
    password: "(bcrypt)$2y$10$ti4vZYIrxVN8rLcYXVgXCO.GJND0dyI49r7IoF3xqIx8bBRmIBZRm"
    badge_name: "管理员"
    badge_color: "#0083ff"
    sites:
      - 站点名 C
      - 站点名 D
```

### 为管理员分配站点

- **sites**：向管理员分配站点，即控制管理员对于站点「[控制中心](../frontend/sidebar.md#控制中心)」的可访问权限。
  
  当未分配站点时，即 sites 未配置时，该账户为「**超级管理员**」，可以管理全部站点：

  ```yaml
  admin_users:
    - name: "super_admin"
      # 未分配 sites，为超级管理员
  ```

  当分配站点后，即 sites 已配置时，该管理员成为「**普通管理员**」：

  ```yaml
  admin_users:
    - name: "a_admin_user"
      # ↓ 为账户分配 sites
      sites:
        - 站点名 A
        - 站点名 B
  ```

  注：你至少需要一个超级管理员，这样才能创建站点。

### 控制管理员接收邮件通知

当页面有新的评论时，邮件会发送给**该站点**的全部管理员，但你可以配置 `receive_email` 强制禁用它。

这对于设定了多个邮箱，但又不希望某些邮箱收到评论邮件的情况很有帮助。

- **receive_email**：设置为 `false` 系统将不会发送邮件通知给该用户。

  注：禁止后该管理员用户仍可以收到来自他人的 @AT 回复，只是当用户对页面进行评论时 (创建根评论时) 不发送邮件通知。

```yaml
admin_users:
  - name: "super_admin"
    # 未分配 sites，即为超级管理员
    receive_email: false # ← 超级管理员不接收邮件

  - name: "a_admin_user"
    # 分配 sites，即为普通管理员
    sites:
      - 站点名 A
      - 站点名 B
```
