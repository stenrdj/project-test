import {FuseNavigation} from '@fuse/types';
import {isCurrentUserOriginator} from '../helpers/oktaUserHelper';
export function navigation(){
    let isUserOriginator:boolean = isCurrentUserOriginator();
      const navigation: FuseNavigation[] = [
        {
            id: 'tenders',
            title: 'Tenders',
            translate: '',
            type: 'group',
            icon: 'apps',
            children: [
               
                {
                    id: 'e-commerce',
                    title: 'Tendering',
                    translate: '',
                    type: 'collapsable',
                    icon: 'compare_arrows',
                    children: [
                        {
                            id: 'tenders-list',
                            title: 'Tenders',
                            type: 'item',
                            url: '/apps/tenders',
                            exactMatch: true
                        }, 
                        {
                            id: 'import',
                            title: 'Import Assets',
                            type: 'item',
                            url: '/apps/data/import',
                            exactMatch: true
                        }, 
                        {
                            id: 'tenders-new',
                            title: 'New Tender',
                            type: 'item',
                            url: '/apps/tenders/new',
                            exactMatch: true
                        }
                    ]
                }, { 
                    id: 'offers',
                    title: 'Offers',
                    translate: '',
                    type: 'collapsable',
                    icon: 'receipt',
                    hidden: false, 
                    children: [
                        {
                            id: 'offers-list',
                            title: 'Offers List',
                            type: 'item',
                            url: '/apps/offers/all',
                            exactMatch: true
                        },{
                            id: 'offer-create',
                            title: 'New Offer',
                            type: 'item',
                            url: '/apps/offers/new',
                            exactMatch: true,
                            hidden:!isUserOriginator
                        }, 
                    ]
                },{ 
                    id: 'geo',
                    title: 'GEO',
                    translate: '',
                    type: 'collapsable',
                    icon: 'widgets',
                    hidden: false, 
                    children: [
                        {
                            id: 'geo-registry',
                            title: 'Registry Files',
                            type: 'item',
                            url: '/apps/geo/registries',
                            exactMatch: true
                        },  {
                            id: 'geo-deals',
                            title: 'Deals',
                            type: 'item',
                            url: '/apps/geo/deals',
                            exactMatch: true
                        },  {
                            id: 'geo-report',
                            title: 'Report',
                            type: 'item',
                            url: '/apps/geo/report',
                            exactMatch: true
                        }, 
                    ]
                },
            ]
        },
        {
            id: 'management',
            title: 'Follow-Up',
            translate: '',
            type: 'group',
            icon: 'work',
            children: [
                {
                    id: 'scrumboard',
                    title: 'Board',
                    translate: '',
                    type: 'item',
                    icon: 'assessment',
                    url: '/apps/scrumboard/boards'
                },/*
                {
                    id: 'to-do',
                    title: 'To-Do',
                    translate: 'NAV.TODO',
                    type: 'item',
                    icon: 'check_box',
                    url: '/apps/todo',
                    badge: {
                        title: '3',
                        bg: '#FF6F00',
                        fg: '#FFFFFF'
                    }
                },
                {
                    id: 'calendar',
                    title: 'Calendar',
                    translate: 'NAV.CALENDAR',
                    type: 'item',
                    icon: 'today',
                    url: '/apps/calendar'
                },
                {
                    id: 'contacts',
                    title: 'Contacts',
                    translate: 'NAV.CONTACTS',
                    type: 'item',
                    icon: 'account_box',
                    url: '/apps/contacts'
                },*/
            ]
        },/*
        {
            id: 'documentation',
            title: 'Documentation',
            translate: '',
            type: 'group',
            icon: 'apps',
            children: [
                {
                    id: 'faq',
                    title: 'Faq',
                    type: 'item',
                    icon: 'help',
                    url: '/pages/faq'
                },
                {
                    id: 'knowledge-base',
                    title: 'Knowledge Base',
                    type: 'item',
                    icon: 'import_contacts',
                    url: '/pages/knowledge-base'
                }
            ]
        }*/
    ];
    return navigation;
}
