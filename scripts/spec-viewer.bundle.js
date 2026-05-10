/* Spec viewer — rendu visuel humain (chargé inline dans le HTML généré). */
(function () {
  'use strict';

  function esc(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function moscowClass(m) {
    if (m === 'Must') return 'moscow-must';
    if (m === 'Should') return 'moscow-should';
    if (m === 'Could') return 'moscow-could';
    return 'moscow-wont';
  }

  function axeClass(axe) {
    var a = (axe || '').toLowerCase();
    if (a.indexOf('création') !== -1 || a.indexOf('creation') !== -1) return 'axe-cre';
    if (a.indexOf('modification') !== -1) return 'axe-mod';
    if (a.indexOf('visualisation') !== -1) return 'axe-vis';
    if (a.indexOf('suppression') !== -1) return 'axe-sup';
    if (a.indexOf('impression') !== -1 || a.indexOf('export') !== -1) return 'axe-prt';
    if (a.indexOf('règle') !== -1 || a.indexOf('calcul') !== -1) return 'axe-rgl';
    if (a.indexOf('alerte') !== -1 || a.indexOf('rappel') !== -1) return 'axe-alt';
    if (a.indexOf('parcours') !== -1 || a.indexOf('conversion') !== -1) return 'axe-pcv';
    if (a.indexOf('facturation') !== -1 || a.indexOf('saas') !== -1) return 'axe-bil';
    if (a.indexOf('sécurité') !== -1 || a.indexOf('compte') !== -1 || a.indexOf('limite') !== -1)
      return 'axe-sec';
    return 'axe-def';
  }

  function starsHtml(n) {
    n = Number(n) || 0;
    var o = '';
    for (var i = 0; i < 3; i++) {
      o +=
        '<span class="star' +
        (i < n ? ' on' : '') +
        '">' +
        (i < n ? '●' : '○') +
        '</span>';
    }
    return '<span class="stars" title="Pertinence P1">' + o + '</span>';
  }

  function renderProject(p) {
    if (!p) return '';
    var rows = [
      ['code', p.code],
      ['version', p.version],
      ['statut', p.status],
      ['créé', p.created_at],
      ['MAJ', p.updated_at],
      ['POC', p.poc_reference],
    ];
    var t = '';
    for (var i = 0; i < rows.length; i++) {
      if (!rows[i][1]) continue;
      t +=
        '<div class="kv"><span class="k">' +
        esc(rows[i][0]) +
        '</span><span class="v">' +
        esc(rows[i][1]) +
        '</span></div>';
    }
    return (
      '<div class="hero-card">' +
      '<div class="hero-badge">Projet</div>' +
      '<h2 class="hero-title">' +
      esc(p.name) +
      '</h2>' +
      (p.notes_version
        ? '<p class="hero-note">' + esc(p.notes_version) + '</p>'
        : '') +
      '<div class="kv-grid">' +
      t +
      '</div></div>'
    );
  }

  function renderListCard(title, icon, items, variant) {
    if (!items || !items.length) return '';
    var li = '';
    for (var i = 0; i < items.length; i++) {
      li += '<li>' + esc(items[i]) + '</li>';
    }
    return (
      '<div class="list-card ' +
      (variant || '') +
      '">' +
      '<div class="list-card-hd"><span class="list-ico">' +
      icon +
      '</span>' +
      esc(title) +
      '</div>' +
      '<ul class="checklist">' +
      li +
      '</ul></div>'
    );
  }

  function renderObjectives(rows) {
    if (!rows || !rows.length) return '';
    var h =
      '<table class="viz-table"><thead><tr><th>Objectif</th><th>Métrique</th><th>Cible</th></tr></thead><tbody>';
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      h +=
        '<tr><td>' +
        esc(r.objectif) +
        '</td><td class="muted">' +
        esc(r.metrique) +
        '</td><td><strong>' +
        esc(r.cible) +
        '</strong></td></tr>';
    }
    h += '</tbody></table>';
    return '<div class="block-title">Objectifs mesurables</div>' + h;
  }

  function renderCDC(spec) {
    var p = spec.project;
    var c = spec.cahier_des_charges;
    if (!c) return '<p class="empty">Pas de cahier des charges.</p>';
    return (
      '<div class="viz-cdc">' +
      renderProject(p) +
      '<div class="prose-grid">' +
      '<article class="prose-card">' +
      '<span class="pill pill-vision">Vision</span>' +
      '<p>' +
      esc(c.vision) +
      '</p></article>' +
      '<article class="prose-card">' +
      '<span class="pill pill-prob">Problème</span>' +
      '<p>' +
      esc(c.probleme) +
      '</p></article>' +
      '<article class="prose-card prose-wide">' +
      '<span class="pill pill-sol">Solution</span>' +
      '<p>' +
      esc(c.solution) +
      '</p></article></div>' +
      renderObjectives(c.objectifs_mesurables) +
      '<div class="two-col">' +
      renderListCard('Périmètre In', '✓', (c.perimetre && c.perimetre.in) || [], 'tone-in') +
      renderListCard('Périmètre Out', '○', (c.perimetre && c.perimetre.out) || [], 'tone-out') +
      '</div>' +
      renderListCard('Contraintes', '⚙', c.contraintes || [], 'tone-ctr') +
      '</div>'
    );
  }

  function renderMatriceAxes(axes) {
    if (!axes || !axes.length) return '';
    var h = '<div class="axes-ribbon">';
    for (var i = 0; i < axes.length; i++) {
      h +=
        '<span class="axe-chip ' +
        axeClass(axes[i]) +
        '">' +
        esc(axes[i]) +
        '</span>';
    }
    h += '</div>';
    return '<div class="block-title">Axes fonctionnels référencés</div>' + h;
  }

  function renderSf(sf) {
    var deps =
      sf.dependance && sf.dependance.length
        ? '<span class="deps">Dépend de : ' +
          sf.dependance.map(function (d) {
            return '<code>' + esc(d) + '</code>';
          }).join(' ') +
          '</span>'
        : '';
    return (
      '<article class="sf-card">' +
      '<header class="sf-hd">' +
      '<span class="sf-id mono">' +
      esc(sf.id) +
      '</span>' +
      '<span class="axe-tag ' +
      axeClass(sf.axe) +
      '">' +
      esc(sf.axe || '—') +
      '</span>' +
      '<span class="' +
      moscowClass(sf.moscow) +
      ' moscow-tag">' +
      esc(sf.moscow) +
      '</span>' +
      starsHtml(sf.persona_relevance && sf.persona_relevance.P1) +
      '<span class="cx-tag">' +
      esc(sf.complexite || '') +
      '</span>' +
      '</header>' +
      '<h4 class="sf-title">' +
      esc(sf.titre) +
      '</h4>' +
      (sf.description ? '<p class="sf-desc">' + esc(sf.description) + '</p>' : '') +
      (deps ? '<footer class="sf-ft">' + deps + '</footer>' : '') +
      '</article>'
    );
  }

  function renderMatriceBloc(b) {
    var sfs = '';
    var list = b.sous_fonctionnalites || [];
    for (var i = 0; i < list.length; i++) sfs += renderSf(list[i]);
    return (
      '<section class="bloc-visual">' +
      '<header class="bloc-visual-hd">' +
      '<span class="mono bloc-id-tag">' +
      esc(b.bloc_id) +
      '</span>' +
      '<h3>' +
      esc(b.titre_bloc) +
      '</h3>' +
      '<p class="bloc-resume">' +
      esc(b.resume_bloc || '') +
      '</p>' +
      '</header>' +
      '<div class="sf-grid">' +
      sfs +
      '</div></section>'
    );
  }

  function renderMatrice(spec) {
    var axes = spec.matrice_axes;
    var blocs = spec.matrice_fonctionnalites_detaillee || [];
    var html = '<div class="viz-matrice">';
    html += renderMatriceAxes(axes);
    html += '<p class="matrice-intro">Chaque bloc regroupe des sous-fonctionnalités classées par axe (création, lecture, etc.). Les titres sont rédigés du point de vue de ce que <strong>l’utilisateur peut faire</strong>.</p>';
    for (var i = 0; i < blocs.length; i++) html += renderMatriceBloc(blocs[i]);
    html += '</div>';
    return html;
  }

  function renderPersonas(spec) {
    var list = spec.personas || [];
    if (!list.length) return '<p class="empty">Aucun persona.</p>';
    var h = '<div class="persona-stack">';
    for (var i = 0; i < list.length; i++) {
      var p = list[i];
      var scen = '';
      var sc = p.scenario || [];
      for (var j = 0; j < sc.length; j++) {
        scen +=
          '<li><span class="sc-step">' +
          esc(sc[j].etape) +
          '</span>' +
          '<span class="sc-act">' +
          esc(sc[j].action) +
          '</span>' +
          '<span class="sc-res muted">→ ' +
          esc(sc[j].resultat) +
          '</span></li>';
      }
      var canals = '';
      var ch = p.canaux || [];
      for (var k = 0; k < ch.length; k++) {
        canals += '<span class="canal-badge">' + esc(ch[k]) + '</span>';
      }
      h +=
        '<article class="persona-card">' +
        '<header><span class="persona-id">' +
        esc(p.id) +
        '</span>' +
        '<h3>' +
        esc(p.nom) +
        '</h3>' +
        '<div class="persona-role">' +
        esc(p.role) +
        '</div>' +
        '<div class="canal-row">' +
        canals +
        '<span class="tech-level">Tech : <strong>' +
        esc(p.competence_tech) +
        '</strong></span></div>' +
        '</header>' +
        '<div class="persona-three">' +
        '<div><span class="mini-lbl">Friction</span><p>' +
        esc(p.friction) +
        '</p></div>' +
        '<div><span class="mini-lbl">Objectif produit</span><p>' +
        esc(p.objectif) +
        '</p></div>' +
        '<div><span class="mini-lbl">Critère de succès</span><p>' +
        esc(p.critere_succes) +
        '</p></div></div>' +
        '<div class="mini-lbl" style="margin-top:14px">Scénario typique</div>' +
        '<ol class="scenario-flow">' +
        scen +
        '</ol>' +
        '</article>';
    }
    h += '</div>';
    return h;
  }

  function renderUS(spec) {
    var list = spec.user_stories || [];
    if (!list.length) return '<p class="empty">Aucune user story.</p>';
    var h = '<div class="us-stack">';
    for (var i = 0; i < list.length; i++) {
      var u = list[i];
      var crit = '';
      var cc = u['critères_acceptation'] || [];
      for (var j = 0; j < cc.length; j++)
        crit += '<li>' + esc(cc[j]) + '</li>';
      var dep =
        u.depend_de && u.depend_de.length
          ? '<div class="us-deps">Dépend de : ' +
            u.depend_de
              .map(function (x) {
                return '<code>' + esc(x) + '</code>';
              })
              .join(' ') +
            '</div>'
          : '';
      h +=
        '<article class="us-card stripe-' +
        moscowClass(u.moscow) +
        '">' +
        '<div class="us-top">' +
        '<span class="mono us-id">' +
        esc(u.id) +
        '</span>' +
        '<span class="moscow-tag ' +
        moscowClass(u.moscow) +
        '">' +
        esc(u.moscow) +
        '</span>' +
        '<span class="cx-pill">' +
        esc(u.complexite) +
        '</span>' +
        '</div>' +
        '<h4>' +
        esc(u.titre) +
        '</h4>' +
        '<blockquote class="us-story">' +
        '<strong>En tant que</strong> ' +
        esc(u.en_tant_que) +
        ', <strong>je veux</strong> ' +
        esc(u.je_veux) +
        ' <strong>afin de</strong> ' +
        esc(u.afin_de) +
        '.' +
        '</blockquote>' +
        '<div class="mini-lbl">Critères d’acceptation</div>' +
        '<ul class="crit-list">' +
        crit +
        '</ul>' +
        dep +
        '</article>';
    }
    h += '</div>';
    return h;
  }

  function renderFluxStep(st, idx) {
    var type = (st.type || '').toLowerCase();
    var sym = type === 'condition' ? '◇' : type === 'resultat' ? '◆' : '▸';
    var extra =
      st.branche_oui || st.branche_non
        ? '<div class="branch muted">oui → ' +
          esc(st.branche_oui) +
          ' · non → ' +
          esc(st.branche_non) +
          '</div>'
        : '';
    return (
      '<div class="flow-step">' +
      '<span class="flow-num">' +
      sym +
      ' ' +
      (idx + 1) +
      '</span>' +
      '<div><span class="flow-type">' +
      esc(st.type || '—') +
      '</span><div class="flow-etape">' +
      esc(st.etape) +
      '</div>' +
      extra +
      '</div></div>'
    );
  }

  function renderDiagrammes(spec) {
    var list = spec.diagrammes_utilisation || [];
    if (!list.length) return '<p class="empty">Aucun diagramme.</p>';
    var h = '';
    for (var i = 0; i < list.length; i++) {
      var d = list[i];
      var steps = d.flux || [];
      var stepHtml = '';
      for (var j = 0; j < steps.length; j++) stepHtml += renderFluxStep(steps[j], j);
      var errs = '';
      var er = d.erreurs || [];
      if (er.length) {
        errs += '<ul class="side-list">';
        for (var e = 0; e < er.length; e++) {
          errs +=
            '<li><strong>' +
            esc(er[e].situation) +
            '</strong> — ' +
            esc(er[e].comportement) +
            '</li>';
        }
        errs += '</ul>';
      }
      var prev = '';
      var pt = (d.pre_conditions || []).map(esc).join(' · ');
      var po = (d.post_conditions || []).map(esc).join(' · ');
      if (pt) prev += '<div><span class="mini-lbl">Préconditions</span><p>' + pt + '</p></div>';
      if (po) prev += '<div><span class="mini-lbl">Postconditions</span><p>' + po + '</p></div>';
      h +=
        '<section class="diag-card">' +
        '<header class="diag-hd">' +
        '<span class="mono diag-f">' +
        esc(d.fonctionnalite_id) +
        '</span>' +
        '<span class="actor-pill">' +
        esc(d.acteur_principal) +
        '</span>' +
        '</header>' +
        '<div class="mini-lbl">Déclencheur</div>' +
        '<p class="diag-trig">' +
        esc(d.declencheur) +
        '</p>' +
        '<div class="flow-track">' +
        stepHtml +
        '</div>' +
        (prev ? '<div class="diag-cond grid-2-small">' + prev + '</div>' : '') +
        (errs
          ? '<div class="mini-lbl">Erreurs / variantes</div>' + errs
          : '') +
        '</section>';
    }
    return '<div class="diag-stack">' + h + '</div>';
  }

  function renderInfra(spec) {
    var ip = spec.infra_phases;
    if (!ip) return '<p class="empty">Aucune clé <code>infra_phases</code> dans cette spec.</p>';

    function ulFromStrings(arr, cls) {
      var a = arr || [];
      if (!a.length) return '<p class="muted">—</p>';
      var h = '<ul class="' + (cls || 'infra-bullet') + '">';
      for (var i = 0; i < a.length; i++) h += '<li>' + esc(a[i]) + '</li>';
      return h + '</ul>';
    }

    function horsScopeChips(arr) {
      var a = arr || [];
      if (!a.length) return '';
      var h =
        '<div class="infra-hors"><span class="mini-lbl">Hors scope MVP</span><div class="infra-chip-row">';
      for (var j = 0; j < a.length; j++) {
        h += '<span class="infra-ban-chip">' + esc(a[j]) + '</span>';
      }
      return h + '</div></div>';
    }

    function miniStackTable(rows) {
      rows = rows || [];
      if (!rows.length) return '<p class="muted">—</p>';
      var t =
        '<table class="viz-table infra-mini-stack"><thead><tr><th>Couche</th><th>Techno</th><th>Note</th></tr></thead><tbody>';
      for (var k = 0; k < rows.length; k++) {
        var r = rows[k];
        t +=
          '<tr><td>' +
          esc(r.couche) +
          '</td><td><strong>' +
          esc(r.technologie) +
          '</strong></td><td class="muted">' +
          esc(r.justification) +
          '</td></tr>';
      }
      return t + '</tbody></table>';
    }

    function phaseCard(title, badge, ph) {
      if (!ph) return '';
      var foot =
        ph.notes_migration || ph.evolution_documentee
          ? '<aside class="infra-foot muted">' +
            esc(ph.notes_migration || ph.evolution_documentee) +
            '</aside>'
          : '';
      return (
        '<article class="infra-phase-card ' +
        badge +
        '">' +
        '<header class="infra-phase-head"><h4>' +
        esc(title) +
        '</h4></header>' +
        (ph.objectif ? '<p class="muted infra-obj">' + esc(ph.objectif) + '</p>' : '') +
        '<div class="block-title infra-sub">Patterns</div>' +
        ulFromStrings(ph.patterns, 'infra-bullet') +
        horsScopeChips(ph.hors_scope_mvp_explicit) +
        '<div class="block-title infra-sub">Stack</div>' +
        miniStackTable(ph.stack) +
        foot +
        '</article>'
      );
    }

    var intro = ip.introduction
      ? '<p class="infra-lead">' + esc(ip.introduction) + '</p>'
      : '';

    var ruleBlock = '';
    var ru = ip.regle_ui_lien_organisationnel;
    if (ru) {
      var res = '';
      var navSteps = ru.resolution_navigation || [];
      for (var n = 0; n < navSteps.length; n++) {
        res += '<li>' + esc(navSteps[n]) + '</li>';
      }
      ruleBlock =
        '<div class="infra-rule-wrap">' +
        '<article class="infra-rule-card">' +
        '<h4>Navigation liste CRM — <span class="infra-accent">' +
        esc(ru.libelle_colonne || 'Lié à') +
        '</span></h4>' +
        '<ol class="infra-res-ol">' +
        res +
        '</ol>' +
        (ru.reference_poc
          ? '<p class="infra-poc-ref"><span class="mini-lbl">Réf. POC</span> <code>' +
            esc(ru.reference_poc) +
            '</code></p>'
          : '') +
        '</article></div>';
    }

    return (
      '<div class="viz-infra">' +
      intro +
      ruleBlock +
      '<div class="infra-grid">' +
      phaseCard('MVP infra minimal', 'infra-mvp', ip.mvp_infra_minimal) +
      phaseCard('V2 aspirationnel', 'infra-v2', ip.v2_aspirationnel) +
      '</div></div>'
    );
  }

  function renderStackTable(rows) {
    var h = '';
    for (var i = 0; i < rows.length; i++) {
      h +=
        '<tr><td>' +
        esc(rows[i].couche) +
        '</td><td>' +
        esc(rows[i].technologie) +
        '</td><td class="muted">' +
        esc(rows[i].justification) +
        '</td></tr>';
    }
    return h;
  }

  function renderTech(spec) {
    var t = spec.spec_technique;
    if (!t) return '';
    var stack = '';
    var ip = spec.infra_phases;
    if (
      ip &&
      ip.mvp_infra_minimal &&
      ip.mvp_infra_minimal.stack &&
      ip.v2_aspirationnel &&
      ip.v2_aspirationnel.stack
    ) {
      stack +=
        '<tbody>' +
        '<tr><td colspan="3"><strong>MVP infra minimal</strong></td></tr>' +
        renderStackTable(ip.mvp_infra_minimal.stack) +
        '<tr><td colspan="3"><strong>V2 aspirationnel</strong></td></tr>' +
        renderStackTable(ip.v2_aspirationnel.stack) +
        '</tbody>';
    } else {
      var st = t.stack || [];
      if (st.length) {
        stack += '<tbody>' + renderStackTable(st) + '</tbody>';
      } else if (t.note_stack_reference) {
        stack +=
          '<tbody><tr><td colspan="3" class="muted">' +
          esc(t.note_stack_reference) +
          '</td></tr></tbody>';
      } else {
        stack += '<tbody></tbody>';
      }
    }
    var contexts = '';
    var bc = t.bounded_contexts || [];
    for (var j = 0; j < bc.length; j++) {
      var ctx = bc[j];
      contexts +=
        '<article class="ctx-card">' +
        '<h4>' +
        esc(ctx.nom) +
        '</h4>' +
        '<p class="muted">' +
        esc(ctx.description) +
        '</p>' +
        '<div class="ctx-meta"><span>Agrégats</span><code>' +
        (Array.isArray(ctx.agregats) ? ctx.agregats : []).map(esc).join(', ') +
        '</code></div>' +
        '</article>';
    }
    var cmd = '';
    var cmds = t.api_commands || [];
    for (var k = 0; k < cmds.length; k++) {
      var c = cmds[k];
      cmd +=
        '<tr><td><code>' +
        esc(c.methode) +
        '</code></td><td class="mono">' +
        esc(c.route) +
        '</td><td>' +
        esc(c.command) +
        '</td><td class="muted">' +
        esc(c.description) +
        '</td></tr>';
    }
    var qry = '';
    var qs = t.api_queries || [];
    for (var q = 0; q < qs.length; q++) {
      var qq = qs[q];
      qry +=
        '<tr><td><code>' +
        esc(qq.methode) +
        '</code></td><td class="mono">' +
        esc(qq.route) +
        '</td><td>' +
        esc(qq.query) +
        '</td><td class="muted">' +
        esc(qq.description) +
        '</td></tr>';
    }
    var fe = '';
    var fp = t.flux_par_phase;
    if (fp && fp.length) {
      for (var p = 0; p < fp.length; p++) {
        var ph = fp[p];
        fe +=
          '<div class="block-title" style="margin-top:' +
          (p ? '14px' : '0') +
          '">' +
          esc(ph.phase || 'Flux') +
          '</div>';
        var et = ph.etapes || [];
        for (var f = 0; f < et.length; f++) {
          var stp = et[f];
          fe +=
            '<div class="fe-step">' +
            '<span class="fe-num">' +
            esc(stp.etape) +
            '</span>' +
            '<span class="fe-type">' +
            esc(stp.type) +
            '</span>' +
            '<span>' +
            esc(stp.description) +
            '</span></div>';
        }
      }
    }
    var fl = t.flux_evenementiel || [];
    if (!fp || !fp.length) {
      for (var ff = 0; ff < fl.length; ff++) {
        fe +=
          '<div class="fe-step">' +
          '<span class="fe-num">' +
          esc(fl[ff].etape) +
          '</span>' +
          '<span class="fe-type">' +
          esc(fl[ff].type) +
          '</span>' +
          '<span>' +
          esc(fl[ff].description) +
          '</span></div>';
      }
    }
    return (
      '<div class="viz-tech">' +
      '<div class="block-title">Stack</div>' +
      '<table class="viz-table">' +
      '<thead><tr><th>Couche</th><th>Technologie</th><th>Justification</th></tr></thead>' +
      stack +
      '</table>' +
      '<div class="block-title">Bounded contexts</div>' +
      '<div class="ctx-grid">' +
      contexts +
      '</div>' +
      '<div class="block-title">Commands</div>' +
      '<table class="viz-table"><thead><tr><th>Méth.</th><th>Route</th><th>Commande</th><th>Desc.</th></tr></thead><tbody>' +
      cmd +
      '</tbody></table>' +
      '<div class="block-title">Queries</div>' +
      '<table class="viz-table"><thead><tr><th>Méth.</th><th>Route</th><th>Query</th><th>Desc.</th></tr></thead><tbody>' +
      qry +
      '</tbody></table>' +
      '<div class="block-title">Flux événementiel</div>' +
      '<div class="fe-track">' +
      fe +
      '</div></div>'
    );
  }

  function renderUX(spec) {
    var u = spec.spec_utilisateur;
    if (!u) return '';
    var onb = '';
    var ob = u.onboarding || [];
    for (var i = 0; i < ob.length; i++) {
      var o = ob[i];
      onb +=
        '<div class="onb-card">' +
        '<span class="onb-num">' +
        esc(o.etape) +
        '</span>' +
        '<div><strong>' +
        esc(o.description) +
        '</strong><p class="muted">Action attendue : ' +
        esc(o.action_attendue) +
        '</p><p class="muted">Feedback : ' +
        esc(o.feedback) +
        '</p></div></div>';
    }
    var par = '';
    var pr = u.parcours || [];
    for (var j = 0; j < pr.length; j++) {
      var p = pr[j];
      var et = '';
      var es = p.etapes || [];
      for (var k = 0; k < es.length; k++) {
        et +=
          '<li>' +
          esc(es[k].description) +
          ' — <em>' +
          esc(es[k].action) +
          '</em> → ' +
          esc(es[k].resultat) +
          '</li>';
      }
      par +=
        '<article class="parc-card"><h4>' +
        esc(p.nom) +
        '</h4><ol>' +
        et +
        '</ol></article>';
    }
    var msg = '';
    var ms = u.messages || [];
    for (var m = 0; m < ms.length; m++) {
      msg +=
        '<tr><td>' +
        esc(ms[m].contexte) +
        '</td><td class="mono">' +
        esc(ms[m].message) +
        '</td></tr>';
    }
    var etr = '';
    var etrs = u.etats_transitions || [];
    for (var e = 0; e < etrs.length; e++) {
      var x = etrs[e];
      etr +=
        '<tr><td>' +
        esc(x.etat_source) +
        '</td><td>' +
        esc(x.condition) +
        '</td><td>' +
        esc(x.action) +
        '</td><td>' +
        esc(x.etat_cible) +
        '</td></tr>';
    }
    var ge = '';
    var ges = u.gestion_erreurs || [];
    for (var g = 0; g < ges.length; g++) {
      var ge1 = ges[g];
      ge +=
        '<tr><td>' +
        esc(ge1.erreur) +
        '</td><td>' +
        esc(ge1.cause) +
        '</td><td>' +
        esc(ge1.message_utilisateur) +
        '</td><td>' +
        esc(ge1.recuperation) +
        '</td></tr>';
    }
    return (
      '<div class="viz-ux">' +
      '<div class="block-title">Onboarding</div>' +
      '<div class="onb-flow">' +
      onb +
      '</div>' +
      '<div class="block-title">Parcours</div>' +
      '<div class="parc-grid">' +
      par +
      '</div>' +
      '<div class="block-title">Messages</div>' +
      '<table class="viz-table messages-tbl">' +
      '<thead><tr><th>Contexte</th><th>Message</th></tr></thead><tbody>' +
      msg +
      '</tbody></table>' +
      '<div class="block-title">États & transitions</div>' +
      '<table class="viz-table">' +
      '<thead><tr><th>État source</th><th>Condition</th><th>Action</th><th>État cible</th></tr></thead><tbody>' +
      etr +
      '</tbody></table>' +
      '<div class="block-title">Gestion des erreurs</div>' +
      '<table class="viz-table">' +
      '<thead><tr><th>Erreur</th><th>Cause</th><th>Message</th><th>Récupération</th></tr></thead><tbody>' +
      ge +
      '</tbody></table></div>'
    );
  }

  function renderPOC(spec) {
    var p = spec.poc_tracking;
    if (!p) return '';
    var f = '';
    var files = p.fichiers || [];
    for (var i = 0; i < files.length; i++) {
      f += '<code class="file-chip">' + esc(files[i]) + '</code>';
    }
    function chips(arr, cls) {
      var h = '';
      for (var j = 0; j < (arr || []).length; j++) {
        h += '<span class="us-chip ' + cls + '">' + esc(arr[j]) + '</span>';
      }
      return h || '<span class="muted">—</span>';
    }
    var todoArr = p.a_faire_poc_avant_migration;
    var freezeTxt = [p.statut_poc, p.note].filter(Boolean).join(' ');
    var thirdLbl = todoArr && todoArr.length ? 'À faire POC' : 'État POC';
    var thirdInner =
      todoArr && todoArr.length
        ? chips(todoArr, 'todo')
        : freezeTxt
          ? '<p class="muted" style="margin:8px 0 0;font-size:13px;line-height:1.5">' +
            esc(freezeTxt) +
            '</p>'
          : '<span class="muted">—</span>';
    return (
      '<div class="viz-poc">' +
      '<div class="poc-cards">' +
      '<div class="poc-mini"><span class="mini-lbl">Fichiers POC</span><div class="file-row">' +
      f +
      '</div></div>' +
      '<div class="poc-mini align"><span class="mini-lbl">Déjà aligné</span><div>' +
      chips(p.deja_aligne, 'ok') +
      '</div></div>' +
      '<div class="poc-mini align"><span class="mini-lbl">' +
      esc(thirdLbl) +
      '</span><div>' +
      thirdInner +
      '</div></div>' +
      '</div></div>'
    );
  }

  function renderOverview(spec) {
    var nbUs = (spec.user_stories || []).length;
    var nbBlocs = (spec.matrice_fonctionnalites_detaillee || []).length;
    var nbSf = 0;
    var bl = spec.matrice_fonctionnalites_detaillee || [];
    for (var i = 0; i < bl.length; i++) nbSf += (bl[i].sous_fonctionnalites || []).length;
    var stats =
      '<div class="stat-bar">' +
      '<div class="stat-item"><span class="stat-num">' +
      esc(spec.project && spec.project.version) +
      '</span><span class="stat-lbl">version spec</span></div>' +
      '<div class="stat-item"><span class="stat-num">' +
      nbBlocs +
      '</span><span class="stat-lbl">blocs matrice</span></div>' +
      '<div class="stat-item"><span class="stat-num">' +
      nbSf +
      '</span><span class="stat-lbl">sous-fonctions</span></div>' +
      '<div class="stat-item"><span class="stat-num">' +
      nbUs +
      '</span><span class="stat-lbl">user stories</span></div>' +
      '</div>';
    return (
      '<div class="overview">' +
      stats +
      '<p class="overview-lead">Vue consolidée — faites défiler pour parcourir toutes les sections dans l’ordre produit.</p>' +
      '<div class="anchor-block" id="ov-cdc"><div class="ov-title">① Projet &amp; CDC</div>' +
      renderCDC(spec) +
      '</div>' +
      '<div class="anchor-block" id="ov-matrice"><div class="ov-title">② Matrice fonctionnelle</div>' +
      renderMatrice(spec) +
      '</div>' +
      '<div class="anchor-block" id="ov-personas"><div class="ov-title">③ Personas</div>' +
      renderPersonas(spec) +
      '</div>' +
      '<div class="anchor-block" id="ov-us"><div class="ov-title">④ User stories</div>' +
      renderUS(spec) +
      '</div>' +
      '<div class="anchor-block" id="ov-flux"><div class="ov-title">⑤ Diagrammes d’utilisation</div>' +
      renderDiagrammes(spec) +
      '</div>' +
      '<div class="anchor-block" id="ov-infra"><div class="ov-title">⑥ Infra (MVP vs V2)</div>' +
      renderInfra(spec) +
      '</div>' +
      '<div class="anchor-block" id="ov-tech"><div class="ov-title">⑦ Spec technique</div>' +
      renderTech(spec) +
      '</div>' +
      '<div class="anchor-block" id="ov-ux"><div class="ov-title">⑧ Spec utilisateur</div>' +
      renderUX(spec) +
      '</div>' +
      '<div class="anchor-block" id="ov-poc"><div class="ov-title">⑨ POC tracking</div>' +
      renderPOC(spec) +
      '</div>' +
      '</div>'
    );
  }

  /** Exposé au HTML généré */
  window.SpecViewer = {
    esc: esc,
    renderCDC: renderCDC,
    renderMatrice: renderMatrice,
    renderPersonas: renderPersonas,
    renderUS: renderUS,
    renderDiagrammes: renderDiagrammes,
    renderInfra: renderInfra,
    renderTech: renderTech,
    renderUX: renderUX,
    renderPOC: renderPOC,
    renderOverview: renderOverview,
  };
})();
