import React, { Component } from 'react'
import Items from '../../items/components/items'
import Navbar from '../../navigation/components/navbar'
import Layout from '../components/homeLayout'
import Form from '../../forms/components/item'
import Auth from '../../forms/components/auth'


class Home extends Component {
  state = {
    items: [],
    urls: {
      list: '/api/items/?format=json',
      new: '/api/items/new',
      update: '/api/items/update',
      delete:'/api/items/delete',
      login: '/api/token/'
    },
    token: localStorage.getItem('token'),
    username: localStorage.getItem('username'),
    isLogin: localStorage.getItem('isLogin'),
    showCreate: false,
  }

  handleError = error => {
    if (error.message === 'e.results is undefined'){
      this.logout()
    }
  }

  getData = () => {
    this.setState({
      items: []
    })
    fetch(this.state.urls.list, {
      'method': 'GET',
       headers: {
        'Content-Type':'application/json',
        Authorization: `JWT ${localStorage.getItem('token')}`
      }
    })
      .then(response => response.json())
      .then(items => {
        items.results.reverse().forEach(item => {
          let data = {
            id: item.id,
            name: item.name,
            description: item.description,
            pub_date: item.pub_date
          }
          this.setState({
            items: this.state.items.concat([data])
          })
        })
    })
      .catch(error => this.handleError(error))
  }

  createItem = event => {
    event.preventDefault()
    let name = event.target[0].value
    let description = event.target[1].value

    fetch(this.state.urls.new, {
      method:  "POST",
      headers: {
        'Content-Type':'application/json',
        Authorization: `JWT ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        "user": this.state.username,
        "name": name,
        "description": description
      })
    })
    .then(response => response.json())
    .then(item => {
      let data = {
      name: item.name,
      description: item.description,
      pub_date: item.pub_date
    }
      this.setState({
        items: this.state.items.concat([data]),
        showCreate: !this.state.showCreate,
      })
    }).catch(error => this.handleError(error))
  }

  login = data => {
    fetch(this.state.urls.login, {
      'method': 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        "username": data.username,
        "password": data.password
      })
    })
      .then(response => response.json())
      .then(json => {
        localStorage.setItem('token', json.token)
        localStorage.setItem('username', json.user.username)
        localStorage.setItem('isLogin', '1')
        if (json.token) {
          this.setState({
            token: localStorage.getItem('token'),
            username: localStorage.getItem('username'),
            isLogin: localStorage.getItem('isLogin'),
          })
          this.getData()
        }
      }).catch(error => this.handleError(error))
  }

  logout = event => {
    event.preventDefault()
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    this.setState({ token: '', username: '', isLogin: false })
  }

  handleClickAdd = event => {
    event.preventDefault()
    this.setState({
      showCreate: !this.state.showCreate,
    })
  }

  removeItem = item => {
    let newItems = this.state.items.slice()
    newItems = newItems.filter(el => el.id!==item.id)
    this.setState({items: newItems})
  }

  handleDelete = (event, item) => {
    event.preventDefault()
    console.log(`${this.state.urls.delete}/${item.id}/`)
    fetch(`${this.state.urls.delete}/${item.id}`, {
      'method': 'DELETE',
       headers: {
        'Content-Type':'application/json',
        Authorization: `JWT ${localStorage.getItem('token')}`
      }
    })
    .then(response => {this.removeItem(item)})
    .catch(error => this.handleError(error))

  }

  handleComplete = (event, item) => {
    console.log(item)
    fetch(`${this.state.urls.update}/${item.id}/`, {
      method:  "PATCH",
      headers: {
        'Content-Type':'application/json',
        Authorization: `JWT ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        "completed": true
      })
    })
    .then(response => {this.removeItem(item)})
    .catch(error => this.handleError(error))

  }

  componentDidMount() {
    if(this.state.token !== '') {
      this.getData()
    }
  }

  render() {
    return (
      <Layout>
        <Navbar
          isLogin={ this.state.isLogin }
          items={[
                  {
                    text: 'New Item',
                    url: '/items/new',
                    handleLink: this.handleClickAdd
                  },
                  {
                    text: 'Logout',
                    url: '/logout',
                    handleLink: this.logout
                  }
            ]}
        />
        {
          this.state.token === '' &&
            <Auth handleLogin={this.login }/>
        }

        {
          this.state.token !== '' &&
            <Items
              items={ this.state.items }
              icons={[
                    {
                      name: 'times',
                      label: 'Delete Task',
                      size: '2x',
                      cssName: 'delete',
                      handleLink: this.handleDelete
                    },
                    {
                      name: 'check',
                      label: 'Complete Task',
                      size: '2x',
                      cssName: 'complete',
                      handleLink: this.handleComplete
                    }
            ]}
            />

        }
        {
          this.state.token !== '' &&
            this.state.showCreate &&
              <Form
                createItem={this.createItem}
              />
        }

        </Layout>
    )
  }

}

export default Home