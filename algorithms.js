function clean_original_link_stream_txt(txt){
      var original_link_stream = {  list_edges:[],
                                    array_edges:[],
                                    teams:[],
                                    t_min,
                                    t_max};
      var list_edges = [];
      var array_edges = [];
      var t_min = Number.MAX_SAFE_INTEGER;
      var t_max = 0;
      var teams = [];
      var parsed_link_stream = txt.split("\n");
      for (var i = 0; i < parsed_link_stream.length; i++){
        var edge_txt = parsed_link_stream[i].split(" ");
        var u = parseInt(edge_txt[0]);
        var v = parseInt(edge_txt[1]);
        var t = parseInt(edge_txt[2]);
        if (t > t_max){t_max = t;}
        if (t < t_min){t_min = t;}
        if (!teams.includes(u)){teams.push(u);}
        if (!teams.includes(v)){teams.push(v);}
        if (array_edges[u] == null){array_edges[u] = [];}
        if (array_edges[u][v] == null){array_edges[u][v] = [];}
        if (!array_edges[u][v].includes(parseInt(t))){
          array_edges[u][v].push(parseInt(t));
        }
      }
      function sortNumber(a,b) {
        return a - b;
      }
      for (var u = 0; u < array_edges.length; u++){
          if (array_edges[u] != null){
          for (var v = 0; v < array_edges[u].length; v++){
            if (array_edges[u][v] != null){
              array_edges[u][v].sort(sortNumber);
              for (var t = 0; t < array_edges[u][v].length; t++){
                var edge = [u,v,array_edges[u][v][t]];
                if (list_edges[list_edges.length - 1] != edge || list_edges.length == 0){
                  list_edges.push(edge);
                }              
              }
            }
          }
        }
      }
      original_link_stream.list_edges = list_edges;
      original_link_stream.array_edges = array_edges;
      original_link_stream.teams = teams;
      original_link_stream.t_min = t_min;
      original_link_stream.t_max = t_max;
      console.log("original: ");
      for (var i = 0; i < original_link_stream.list_edges.length; i++){console.log(original_link_stream.list_edges[i]);}
      return original_link_stream;
    }
    function original_to_gamma_link_stream(original, gamma){
      var gamma_link_stream = { list_edges:[],
                                array_edges:[],
                                teams:original.teams,
                                t_min:original.t_min,
                                t_max:original.t_max};
      var gamma_counter = 0;
      var last_u = -1;
      var last_v = -1;
      var last_t = original.t_max;
      for (var i = 0; i < original.list_edges.length; i++){
        var u = original.list_edges[i][0];
        var v = original.list_edges[i][1];
        var t = original.list_edges[i][2];
        if (u == last_u && v == last_v && t == last_t + 1){
          gamma_counter++;
        }
        else{
          gamma_counter = 0;
        }
        if (gamma_counter >= gamma-1){
          var gamma_edge = [u,v,t-gamma+1,t];
          gamma_link_stream.list_edges.push(gamma_edge);
        }
        last_u = u;
        last_v = v;
        last_t = t;
      }
      for (var i = 0; i < gamma_link_stream.list_edges.length; i++){
        var u = gamma_link_stream.list_edges[i][0];
        var v = gamma_link_stream.list_edges[i][1];
        var t_beg = gamma_link_stream.list_edges[i][2];
        var t_end = gamma_link_stream.list_edges[i][3];
        if (gamma_link_stream.array_edges[u] == null){
          gamma_link_stream.array_edges[u] = [];
        }
        if (gamma_link_stream.array_edges[u][v] == null){
          gamma_link_stream.array_edges[u][v] = [];
        }
        gamma_link_stream.array_edges[u][v].push(gamma_link_stream.list_edges[i]);
      }
      console.log(" ");
      console.log("gamma: ");
      for (var i = 0; i < gamma_link_stream.list_edges.length; i++){console.log(gamma_link_stream.list_edges[i]);}
      return gamma_link_stream;
    }
    function gamma_to_2approx_link_stream(gamma_link_stream){
      var approx_link_stream = {  list_edges:[],
                                  list_incompatibles:[],
                                  teams:gamma_link_stream.teams,
                                  t_min:gamma_link_stream.t_min,
                                  t_max:gamma_link_stream.t_max};
      var list_edges_gamma_copy = gamma_link_stream.list_edges.slice(0,gamma_link_stream.list_edges.length);
      while (list_edges_gamma_copy.length > 0){
        var edge = list_edges_gamma_copy.shift();
        approx_link_stream.list_edges.push(edge);
        for (var i = list_edges_gamma_copy.length - 1; i >= 0; i--){
          if (!compatible_edges(edge,list_edges_gamma_copy[i])){
            approx_link_stream.list_incompatibles.push(list_edges_gamma_copy[i]);
            list_edges_gamma_copy.splice(i,1);
          }
        }
      }
      console.log(" ");
      console.log("approx: ");
      for (var i = 0; i < approx_link_stream.list_edges.length; i++){console.log(approx_link_stream.list_edges[i]);}
      return approx_link_stream;
    }
    function approx_to_kernel(approx_link_stream){
      var k = approx_link_stream.list_edges.length;
      var list_edges = approx_link_stream.list_edges;
      var list_incompatibles = approx_link_stream.list_incompatibles;
      var kernel_link_stream = {  list_edges:[],
                                  teams:approx_link_stream.teams,
                                  t_min:approx_link_stream.t_min,
                                  t_max:approx_link_stream.t_max};
      for (var i = 0; i < approx_link_stream.list_edges.length; i++){
        kernel_link_stream.list_edges.push(approx_link_stream.list_edges[i]);
        var incompatible_edges_counter = 0;
        for (var j = 0; j < approx_link_stream.list_incompatibles.length && incompatible_edges_counter < 2 * k - 1; j++){
          if (!compatible_edges(approx_link_stream.list_edges[i],approx_link_stream.list_incompatibles[j])){
            if (!kernel_link_stream.list_edges.includes(approx_link_stream.list_incompatibles[j])){
              kernel_link_stream.list_edges.push(approx_link_stream.list_incompatibles[j]);
            }
            incompatible_edges_counter++;
          }
        }
      }
      console.log(" ");
      console.log("kernel: ");
      for (var i = 0; i < kernel_link_stream.list_edges.length; i++){console.log(kernel_link_stream.list_edges[i]);}
      return kernel_link_stream;
    }
    function compatible_edges(edge_1, edge_2){
      var u1 = parseInt(edge_1[0]), v1 = parseInt(edge_1[1]), deb1 = parseInt(edge_1[2]), end1 = parseInt(edge_1[3]);
      var u2 = parseInt(edge_2[0]), v2 = parseInt(edge_2[1]), deb2 = parseInt(edge_2[2]), end2 = parseInt(edge_2[3]);
      if (u1 == u2 || u1 == v2 || v1 == u2 || v1 == v2){
        if ((deb1 >= deb2 && deb1 <= end2) || (end1 >= deb2 && end1 <= end2)){
          return false;
        }
      }
      return true;
    }
    function sort_edges_by_time(a,b) {
      if (a[2] < b[2]) {return -1;}
      if (a[2] > b[2]) {return 1;}
      if (a[0] < b[0]) {return -1;}
      if (a[0] > b[0]) {return 1;}
      if (a[1] < b[1]) {return -1;}
      if (a[1] > b[1]) {return 1;}
      return 0;
    }

    function improved_kernel(gamma_link_stream){

      var composantes_connexes = composantes_connexes_link_stream(gamma_link_stream);

      var kernel_link_stream = {  list_edges:[],
                                  teams:gamma_link_stream.teams,
                                  t_min:gamma_link_stream.t_min,
                                  t_max:gamma_link_stream.t_max};
      for (var z = 0; z < composantes_connexes.length; z++){

        var link_stream_composante = {list_edges:[], teams:[], t_min:0, t_max:0};
        link_stream_composante.list_edges = composantes_connexes[z];

        for (var zz = 0; zz < link_stream_composante.list_edges.length; zz++){console.log(link_stream_composante.list_edges[zz]);}

        var approx_composante = gamma_to_2approx_link_stream(link_stream_composante);
        for (var zz = 0; zz < approx_composante.list_edges.length; zz++){console.log(approx_composante.list_edges[zz]);}

        var kernel_composante = approx_to_kernel(approx_composante);
        for (var zz = 0; zz < kernel_composante.list_edges.length; zz++){console.log(kernel_composante.list_edges[zz]);}
        for (var zz = 0; zz < kernel_composante.list_edges.length; zz++){kernel_link_stream.list_edges.push(kernel_composante.list_edges[zz]);}

      }

      return kernel_link_stream;

    }


    function composantes_connexes_link_stream(gamma_link_stream){
      var approx_link_stream = {  list_edges:[],
                                  list_incompatibles:[],
                                  teams:gamma_link_stream.teams,
                                  t_min:gamma_link_stream.t_min,
                                  t_max:gamma_link_stream.t_max};
      var list_edges_gamma_copy = gamma_link_stream.list_edges.slice(0,gamma_link_stream.list_edges.length);
      var composantes_connexes = [];
      while (list_edges_gamma_copy.length > 0){
        var edge = list_edges_gamma_copy.shift();
        var composantes_pour_edge = [];
        for (var j = composantes_connexes.length - 1; j >= 0; j--){
          for (var z = 0; z < composantes_connexes[j].length; z++){
            if (!compatible_edges(edge, composantes_connexes[j][z])){
              composantes_pour_edge.push(j);
              break;
            }
          }
        }
        if (composantes_pour_edge.length == 0){
          var nouvelle_composante = [edge];
          composantes_connexes.push(nouvelle_composante);
        }
        if (composantes_pour_edge.length == 1){
          composantes_connexes[composantes_pour_edge[0]].push(edge);
        }
        if (composantes_pour_edge.length > 1){
          var nouvelle_composante = [];
          nouvelle_composante.push(edge);
          for (var z = 0; z < composantes_pour_edge.length; z++){
            nouvelle_composante.concat(composantes_connexes[composantes_pour_edge[z]]);
            composantes_connexes.splice(composantes_pour_edge[z],1);
          }
          composantes_connexes.push(nouvelle_composante);
        }
      }
      return composantes_connexes;
    }


    function my_random() {
        var x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }