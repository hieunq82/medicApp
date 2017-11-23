angular.module('drugmonApp').controller('AppCtrl', function($scope,$http,$filter,$timeout) {

    $scope.monthly_reporting_ratio = {};
    $scope.total_number = {};
    $scope.data_reports = [];
    $scope.sort_by_month = {};
    $scope.drugs = [];
    $scope.drug_selected = {};
    $scope.get_drug_list = function () {
        $http.post('/drugs/list', {}).then(function(rs){
            $scope.drugs = [];
            $scope.drugs = rs.data.docs;

            if($scope.drugs.length >= 1){
                $scope.monthly_rp_by_drug($scope.drugs[0].drug_code);
                $scope.drug_selected = $scope.drugs[0];
            }

        }, function(){
            console.log('Error!');
        });

        $http.post('/healthfacility/list', {}).then(function(rs){
            $scope.list_hf = rs.data.docs;
        }, function(){
            console.log('Error!');
        });


        // //Todo: Get drugs
        $http.post('/drugs/list', {}).then(function(rs){
            $scope.list_drug = [];
            $scope.list_drug = rs.data.docs;
        }, function(){
            console.log('Error!');
        })


    }

    $scope.get_data_reports = function(){
    //Get data register
    $http.post('/drug_histories/list', {}).then(function(rs){
        $scope.data_reports = rs.data.docs;
        $scope.data_reports.forEach(function(e_drug){
            var _xdate = new Date(e_drug.createdAt);
            var _month = _xdate.getMonth()+1;
            var _year = _xdate.getFullYear();

            if(!$scope.sort_by_month[_year]){
                $scope.sort_by_month[_year] = {};
            }
            if(!$scope.sort_by_month[_year][_month]){
                $scope.sort_by_month[_year][_month] = {}
            }
            if(!$scope.sort_by_month[_year][_month][e_drug.hf_id]){
                $scope.sort_by_month[_year][_month][e_drug.hf_id] = {
                    data: []
                }
            }
            $scope.sort_by_month[_year][_month][e_drug.hf_id].data.push(e_drug);
        })

        get_data_chart($scope.sort_by_month);
    }, function(){
        console.log('Error!');
    })
    }


    $scope.monthly_rp_by_drug = function(drug_code){
        var by_drugs = {};
        $scope.by_drugs_reports = [];
        var _current_date = new Date();
        var _current_month = _current_date.getMonth()+1;
        var _last_month = _current_month-1;
        var _current_year = _current_date.getFullYear();
        var _compare_month = [_last_month,_current_month];
                //Loop Month
        _compare_month.forEach(function(e_month){

            for (var hf_idx in $scope.sort_by_month[_current_year][e_month]) {
                var each_hf = $scope.sort_by_month[_current_year][e_month][hf_idx];
                each_hf.data.forEach(function(each_drug){
                    if(each_drug.drug_code == drug_code){
                        if(!by_drugs[e_month]){
                            by_drugs[e_month]= {
                                name:str_pad(e_month)+"/"+_current_year,
                                data : []
                            }
                        }
                        by_drugs[e_month].data.push({
                            hf_name: each_drug.hf_detail.name,
                            drug_code: each_drug.drug_code,
                            drug_abs: each_drug.drug_abs,
                            drug_asl: each_drug.drug_asl,
                            drug_eop: each_drug.drug_eop,
                            is_eop : (each_drug.drug_abs <= each_drug.drug_eop ? true : false),
                            is_asl : (each_drug.drug_abs > each_drug.drug_asl ? true : false)
                        })
                    }
                })

                var _total_eop = by_drugs[e_month].data.filter(function(rs){ return rs.is_eop});
                var _total_asl = by_drugs[e_month].data.filter(function(rs){ return rs.is_asl});
                var _total_eop_month =  by_drugs[e_month].data.reduce(function (sum,value) {
                        return sum+value.drug_abs;
                },0)
                by_drugs[e_month].percent_eop = (_total_eop.length/by_drugs[e_month].data.length)*100;
                by_drugs[e_month].percent_asl = (_total_asl.length/by_drugs[e_month].data.length)*100;
                by_drugs[e_month].total_eop_month = _total_eop_month;
            }

        })

        //
        // for(var ifih in by_drugs){
        //     var tm_data = by_drugs[ifih];
        //     tm_data.status_eop = (by_drugs[_current_month].percent_eop>by_drugs[_last_month].percent_eop ? 'up' : (by_drugs[_current_month].percent_eop<by_drugs[_last_month].percent_eop ? 'down' : '-'));
        //     tm_data.status_asl = (by_drugs[_current_month].percent_asl>by_drugs[_last_month].percent_asl ? 'up' : (by_drugs[_current_month].percent_asl<by_drugs[_last_month].percent_asl ? 'down' : '-'));
        //
        //     $scope.by_drugs_reports.push(tm_data);
        // }

        $scope.by_drugs_reports = [
            {
                "month": str_pad(_last_month)+"/"+_current_year,
                "name": "EOP",
                "percent_lastmonth": by_drugs[_last_month].percent_eop.toFixed(2),
                "percent_current": by_drugs[_current_month].percent_eop.toFixed(2),
                "status": (by_drugs[_current_month].percent_eop>by_drugs[_last_month].percent_eop ? 'up' : (by_drugs[_current_month].percent_eop<by_drugs[_last_month].percent_eop ? 'down' : '-'))
            },
            {
                "month": str_pad(_current_month)+"/"+_current_year,
                "name": "ASL",
                "percent_lastmonth": by_drugs[_last_month].percent_asl.toFixed(2),
                "total_eop_month": by_drugs[_last_month].total_eop_month,
                "percent_current": by_drugs[_current_month].percent_asl.toFixed(2),
                "status": (by_drugs[_current_month].percent_asl>by_drugs[_last_month].percent_asl ? 'up' : (by_drugs[_current_month].percent_asl<by_drugs[_last_month].percent_asl ? 'down' : '-'))

            }
        ];

    }

    $scope.get_data_reports();
    $scope.get_drug_list();


    function str_pad(n) {
        return String("00" + n).slice(-2);
    }


    $scope.data_col_chart = {};
    function get_data_chart(obj,by_drug){
        $scope.data_col_chart = {};
        var data_col_chart = [];
        for(var index in obj) {
            //Loop Year
            var data_charts = {};
            for(var month_idx in obj[index]){
                //Loop Month
                //Check if selected HF
                if($scope.slt_hf && obj[index][month_idx][$scope.slt_hf] && obj[index][month_idx][$scope.slt_hf].data){
                    var hist = {};
                    obj[index][month_idx][$scope.slt_hf].data.map( function (a) { if (a.drug_code in hist) hist[a.drug_code] = hist[a.drug_code]+parseInt(a.drug_abs); else hist[a.drug_code] = parseInt(a.drug_abs); } );

                    var list_month = [];

                    for(var abx in $scope.list_drug){
                       // list_month.push([$scope.list_drug[abx].drug_name,{role: "annotation"}]);
                        if(hist[$scope.list_drug[abx].drug_code]){
                            list_month.push({
                                code:$scope.list_drug[abx].drug_code,
                                total:hist[$scope.list_drug[abx].drug_code]
                            })
                        }else{
                            list_month.push({
                                code:$scope.list_drug[abx].drug_code,
                                total:0
                            })
                        }
                    }
                    data_charts[month_idx] = list_month;
                    data_col_chart = data_charts;

                    var collect_data_chart = [];
                    var first_row = [],
                        is_get_header = false,
                        month_prefix = ["Month"];
                    var row_arr = [];

                    for(var idx in data_col_chart){
                        var col_header = [str_pad(idx) + '/2017'];
                        var col_arr = [];

                        if(by_drug == 0 || by_drug == undefined){
                            data_col_chart[idx].forEach(function(ecol){
                                    if(is_get_header != true){
                                        first_row.push(ecol.code,{role: "annotation"});
                                    }
                                    col_arr.push(ecol.total);
                                    col_arr.push(ecol.total);
                            })
                        }else{
                            //Select drug
                            data_col_chart[idx].forEach(function(ecol){
                                if(by_drug != 0 && ecol.code == by_drug){
                                    if(is_get_header != true){
                                        first_row = [ecol.code,{role: "annotation"}];
                                    }
                                    col_arr.push(ecol.total);
                                    col_arr.push(ecol.total);
                                }
                            })
                        }

                        is_get_header = true;
                        row_arr.push(col_header.concat(col_arr));
                    }

                    collect_data_chart.push(month_prefix.concat(first_row));
                    $scope.data_col_chart = collect_data_chart.concat(row_arr);
                }


                //$scope.data_col_chart.push(_tmp_obj);
            }
        }
    }

    $scope.monthly_reporting_ratio.type = "ColumnChart";
    $scope.total_number.type = "PieChart";

    $scope.total_number.data = {"cols": [
        {id: "t", label: "Topping", type: "string"},
        {id: "s", label: "Slices", type: "number"}
    ], "rows": [
        {c: [
            {v: "Reporting Center"},
            {v: 3},
        ]},
        {c: [
            {v: "Health Post"},
            {v: 31}
        ]}
    ]};

    $scope.monthly_reporting_ratio.data = {"cols": [
        {id: "t", label: "Topping", type: "string"},
        {id: "s", label: "Health Post", type: "number"}
    ], "rows": $scope.data_col_chart};

    $scope.monthly_reporting_ratio.options = {
        'title': '',
        'isStacked':'normal',
        "displayExactValues": true
    };

    var sample = [
        ["Month",'CHX',{role: "annotation"}, 'MSO',{role: "annotation"}, 'OXI',{role: "annotation"}],
        ['05/2017', 30,30, 103,103, 37, 37],
        ['06/2017', 60,60, 45,45, 322, 322],
        ['07/2017', 20,20, 300,300, 20, 20]
    ];


    $scope.slt_hf = '';
    $scope.slt_drug = '0';
    $scope.draw_now = false;
    $scope.change_slt_hf = function(){
        $scope.slt_drug = '0';
        get_data_chart($scope.sort_by_month);
        $scope.myChartObject = {
            "type": "ColumnChart",
            "displayed": false,
            "data": $scope.data_col_chart,
            "options": {
                "title": "",
                "isStacked": "false",
                "displayExactValues": true,
                "displayAnnotations": true,
                annotations: {
                    textStyle: {
                        fontSize: 13,
                    },
                    alwaysOutside: true
                },

                "vAxis": {
                    "title": "Numbers",
                },
                "hAxis": {
                    "title": "Date"
                },
                "colorAxis": {"colors": ['#868686', '#C0504D','#9BBB59']},

                "seriesType": "bars",
                "series": {5: {"type": "line","role":"annotation"}},
            }
        }

        $scope.draw_now = true;

    }

    $scope.change_slt_drug = function () {
        get_data_chart($scope.sort_by_month,$scope.slt_drug);
        $scope.myChartObject = {
            "type": "ColumnChart",
            "displayed": false,
            "data": $scope.data_col_chart,
            "options": {
                "title": "",
                "isStacked": "false",
                "displayExactValues": true,
                "displayAnnotations": true,
                annotations: {
                    textStyle: {
                        fontSize: 13,
                    },
                    alwaysOutside: true
                },

                "vAxis": {
                    "title": "Numbers",
                },
                "hAxis": {
                    "title": "Date"
                },
                "colorAxis": {"colors": ['#868686', '#C0504D','#9BBB59']},

                "seriesType": "bars",
                "series": {5: {"type": "line","role":"annotation"}},
            }
        }

        $scope.draw_now = true;

    }

    $scope.errorHandler = function(){
        $scope.myChartObject = {};
        $scope.draw_now = false;
    }


    ///

    $scope.list_month = [];
    $scope.filterByMonth = function(){
        var _current_date = new Date();
        var _current_month = _current_date.getMonth()+1;
        var months = moment.monthsShort();
        $scope.list_months = months.slice(0,_current_month);
        $scope.list_month = $scope.list_months.map(function(rs,idx){
            return {
                month_id:idx+1,
                month_name: rs + ', '+_current_date.getFullYear()
            };
        })
    }

    $scope.filterByMonth();


    $scope.overview_slt_hf = '';
    $scope.overview_slt_month = '0';
    $scope.dataFilter = {};
    $scope.dataSort = {};
    $scope.change_slt_overview = function () {
        if($scope.overview_slt_hf != 0){
            $scope.dataFilter.hf_id = $scope.overview_slt_hf;
        }else{
            $scope.dataFilter.hf_id = undefined;
        }
    }
    $scope.change_slt_month = function () {
        if($scope.overview_slt_month != 0){
            $scope.dataFilter.month = $scope.overview_slt_month;
        }else{
            $scope.dataFilter.month = undefined;
        }
    }

    $scope.set_orderBy = function(type){
        $scope.dataSort = type;
    }


    //Export overview D
    $scope.exportData = function () {
        var template_import = [];
        $scope.dataOverView.forEach(function(each,indx){
            var x_each_line = {
                "#"           : indx+1,
                "HF_NAME"     : each.hf_name,
                "DRUG_NAME"   : each.drug_name,
                "ASL"         : each.total_asl,
                "EOP"         : each.total_eop,
                "STOCK"       : each.total_abs,
                "MONTH"       : each.month,
                "STATUS"      : '-'
            };
            template_import.push(x_each_line);
        });

        alasql('SELECT * INTO XLSX("DRUGMON_DataExport.xlsx",{headers:true}) FROM ?',[template_import]);

    };
    //Export overview D
    $scope.exportDataUsage = function () {
        var template_import = [];
        $scope.usage_summary.forEach(function(each,indx){
            var x_each_line = {
                "#"           : indx+1,
                "DRUG_NAME"     : each.drug_name,
                "TOTAL"   : each.drug_total
            };
            template_import.push(x_each_line);
        });

        alasql('SELECT * INTO XLSX("DRUGMON_UsageReport.xlsx",{headers:true}) FROM ?',[template_import]);

    };


    $scope.init_load_data = function(){
        $timeout(function(){
            $scope.general_overview_data();
        },1000)
    }

    //General data
    $scope.general_overview_data = function(){

        var group_byHF = [];
        for(var index in $scope.sort_by_month) {
            //Loop Year
            var data_charts = {};
            for(var month_idx in $scope.sort_by_month[index]){
                //Loop Month

                for(var loop_hf in $scope.sort_by_month[index][month_idx]){

                    var xdata = $scope.sort_by_month[index][month_idx][loop_hf].data;
                    //generate


                    var tmp_drug_group = {};
                    xdata.forEach(function(rs){
                        if(!tmp_drug_group[rs.drug_code]){
                            tmp_drug_group[rs.drug_code] = {
                                total_asl: parseInt(rs.drug_asl),
                                total_eop: parseInt(rs.drug_eop),
                                total_abs: parseInt(rs.drug_abs),
                                hf_name: rs.hf_detail.name,
                                month : month_idx,
                                hf_id:loop_hf,
                                drug_name: rs.drug_name,
                                drug_code: rs.drug_code
                            }
                        }else{
                            tmp_drug_group[rs.drug_code].total_asl = tmp_drug_group[rs.drug_code].total_asl + parseInt(rs.drug_asl);
                            tmp_drug_group[rs.drug_code].total_eop = tmp_drug_group[rs.drug_code].total_eop + parseInt(rs.drug_eop);
                            tmp_drug_group[rs.drug_code].total_abs = tmp_drug_group[rs.drug_code].total_abs + parseInt(rs.drug_abs);
                        }
                    })


                    group_byHF.push(tmp_drug_group);

                }
            }
        }
        var okdata = [];
        group_byHF.forEach(function (exs) {
            for(var code in exs){
                okdata.push(exs[code]);
            }
        })

        $scope.dataOverView = okdata;
    }


    //3th
    $scope.usage_slt_hf = 0;
    $scope.usage_slt_drug = 0;
    $scope.usage_summary = [];
    $scope.select_usage_hf = function(){

        var data_to_show = angular.copy($scope.dataOverView);


        if($scope.usage_slt_hf != 0){
            data_to_show = data_to_show.filter(function(rs){ return rs.hf_id == $scope.usage_slt_hf})
        }
        if($scope.usage_slt_drug != 0){
            data_to_show = data_to_show.filter(function(rs){ return rs.drug_code == $scope.usage_slt_drug})
        }


        var xusage = _.groupBy(data_to_show, function(b) { return b.drug_code});
        var x_drugTotal = [];
        for(var xu in xusage){
            var obj_drug = {
                drug_code: xu,
                drug_name: xu,
                drug_total:0
            }
            xusage[xu].forEach(function (rs) {
                obj_drug.drug_total = obj_drug.drug_total+rs.total_asl
            })

            x_drugTotal.push(obj_drug);
        }
        $scope.usage_summary = x_drugTotal;

    }




});