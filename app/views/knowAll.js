import React, { Component } from 'react'
import { connect } from 'react-redux'
import { ScrollView,View,Text,RefreshControl,Alert } from 'react-native'
import Header from '../components/header'
import KnowAllList from '../containers/knowAllList'
import * as newsActions from '../actions/news'
import * as appStateActions from '../actions/appState'

class KnowAll extends Component {

    constructor(props){
        super(props)
        this.state={
            refreshing:false,
            page:1,
            sign:this.props.nav.routes[1].params.sign
        }

    }

    refreshFun(sign){
        const {dispatch} = this.props
        this.setState({//开始刷新
            refreshing: true,
            page:1
        })
        fetch(`http://zxzx119.com/api?method=querywaterfall&page=1&pagesize=10&taxonomyid=${sign}`)
        .then(res=>res.json())
        .then(resj=>{
            const list = resj.data.list
            if(resj.errorCode==0){
                if(sign==5){
                    dispatch(newsActions.loadNewList({newsList:list}))
                }else{
                    dispatch(newsActions.loadEncyList({encyList:list}))
                }
                this.setState(prevState=>({
                    refreshing: false,
                    page:prevState.page+1
                }))
            }
        })
        .catch(err=>{
            console.log(err)
            Alert.alert('提示',err)
            this.setState(prevState=>({
                refreshing: false,
                page:prevState.page
            }))
        })
    }

    pullAddFun(sign){//打开页面时会先执行一次
        const {dispatch} = this.props
        return dispatch=>{
            dispatch(appStateActions.fetch({fetching:true}))
            fetch(`http://zxzx119.com/api?method=querywaterfall&page=${this.state.page}&pagesize=10&taxonomyid=${sign}`)
            .then(res=>res.json())
            .then(resj=>{
                //const oldList = this.props.news.newsList
                let oldList
                if(sign==5){
                    oldList = this.props.news.newsList
                }else{
                    oldList = this.props.news.encyList
                }
                const newList = resj.data.list
                if(resj.errorCode==0){
                    if(sign==5){
                        dispatch(newsActions.loadNewList({newsList:[...oldList,...newList]}))
                    }else{
                        dispatch(newsActions.loadEncyList({encyList:[...oldList,...newList]})) 
                    }
                    this.setState(prevState=>({
                        refreshing: false,
                        page:prevState.page+1
                    }))
                    dispatch(appStateActions.fetchEnd({fetching:false}))
                    console.log('add')
                }
            })
            .catch(err=>{
                console.log(err)
                Alert.alert('提示',err)
                this.setState(prevState=>({
                    refreshing: false,
                    page:prevState.page
                }))
                dispatch(appStateActions.fetchEnd({fetching:false}))
            })
        }
    }

    render() {
        // const icons=['bell-o','search']
        const icons=['search']
        const {dispatch} = this.props
        return (
            <View style={{flex:1}}>
                <Header type='title' title={this.state.sign==5?'热点新闻':'消防百科'}/>
                <KnowAllList 
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={()=>this.refreshFun(this.state.sign)}
                            tintColor="#ccc"
                            title="Loading..."
                            titleColor="#ccc"
                        />}
                    showsVerticalScrollIndicator={false}
                    onEndReachedThreshold={.1}
                    onEndReached={info=>dispatch(this.pullAddFun(this.state.sign))}
                    newsList={this.state.sign==5?this.props.news.newsList:this.props.news.encyList}
                    title={this.state.sign==5?'热点新闻':'消防百科'}/>
            </View>
        )
    }
}

const mapStateToProps = store=>({
    news:store.news,
    nav:store.nav
})

export default connect(mapStateToProps)(KnowAll)
